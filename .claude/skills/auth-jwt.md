---
name: auth-jwt
description: JWT + bcrypt authentication implementation guide for the NestJS backend. Load before implementing auth module, guards, or any protected route.
---

# Auth: JWT + bcrypt Implementation

## Package setup

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
npm install -D @types/passport-jwt @types/bcryptjs
```

## Prisma schema

```prisma
enum UserRole {
  CUSTOMER
  ADMIN
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         UserRole @default(CUSTOMER)
  createdAt    DateTime @default(now())
  cart         Cart?
  orders       Order[]
}
```

## Auth module structure

```
auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── dto/
│   ├── signup.dto.ts
│   └── login.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── roles.decorator.ts
│   └── current-user.decorator.ts
└── strategies/
    └── jwt.strategy.ts
```

## AuthService

```typescript
// auth.service.ts
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, passwordHash, role: 'CUSTOMER' },
    });
    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.issueToken(user);
  }

  private issueToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwt.sign(payload);
    return { token, user: this.sanitize(user) };
  }

  // CRITICAL: Never return passwordHash
  private sanitize(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
```

## JWT Strategy

```typescript
// strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    // Return value is attached to request.user
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
```

## Guards

```typescript
// guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>('roles', [
      ctx.getHandler(), ctx.getClass(),
    ]);
    if (!required) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return required.includes(user.role);
  }
}

// decorators/roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user
);
```

## Auth module wiring

```typescript
// auth.module.ts
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    PassportModule,
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
```

## Global setup (main.ts)

```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
app.useGlobalFilters(new AllExceptionsFilter());
```

## Using guards on admin routes

```typescript
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminProductsController { ... }
```

## .env variables required

```env
JWT_SECRET=your-super-secret-key-change-this
```

## Security checklist

- [ ] bcrypt cost factor ≥ 10 (use 12 for good balance)
- [ ] `passwordHash` never in any `select` or response object
- [ ] JWT secret loaded from `ConfigService`, never hardcoded
- [ ] `UnauthorizedException` uses same message for wrong email AND wrong password (prevent enumeration)
- [ ] `JwtAuthGuard` applied to every non-public route
- [ ] `RolesGuard` + `@Roles('ADMIN')` applied to every `/admin/*` route
