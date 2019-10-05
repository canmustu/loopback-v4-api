import { inject, BindingKey, Getter } from '@loopback/context';
import { HttpErrors, Request } from '@loopback/rest';
import { AuthenticationStrategy, TokenService, AuthenticationBindings, AuthenticationMetadata } from '@loopback/authentication';
import { UserProfile } from '@loopback/security';
import { TokenServiceBindings, UserServiceBindings } from '../keys';
import { Credentials } from '../repositories/user.repository';
import { User } from '../models/user.model';
import { IMyUserService } from '../services/user-service';

export interface AuthenticationStrategyOptions {
  [property: string]: any;
}

export namespace JWTAuthenticationStrategyBindings {
  export const DEFAULT_OPTIONS = BindingKey.create<
    AuthenticationStrategyOptions
  >('authentication.strategies.jwt.defaultoptions');
}

export class JWTAuthenticationStrategy implements AuthenticationStrategy {
  name = 'jwt';
 
  @inject(JWTAuthenticationStrategyBindings.DEFAULT_OPTIONS) options: AuthenticationStrategyOptions

  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE) public tokenService: TokenService,
    @inject.getter(AuthenticationBindings.METADATA) readonly getMetaData: Getter<AuthenticationMetadata>,
    @inject(UserServiceBindings.USER_SERVICE) public userService: IMyUserService<User,Credentials>
  ) { }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    console.log(this.options);
    await this.processAuthenticateOptions();
    console.log(this.options);
    const token: string = this.extractCredentials(request);
    const userProfile: UserProfile = await this.tokenService.verifyToken(token);
    const isAuthorized = await this.userService.verifyAuthorization(userProfile, this.options.roles, this.options.roleControlType);
    if(isAuthorized){
      return userProfile;
    } else {
      throw new HttpErrors.Unauthorized();
    }
  }

  async processAuthenticateOptions() {
    /**
        Obtain the options object specified in the @authenticate decorator
        of a controller method associated with the current request.
        The AuthenticationMetadata interface contains : strategy:string, options?:object
        We want the options property.
    */
    const controllerMethodAuthenticationMetadata = await this.getMetaData();

    if (!this.options) this.options = {}; //if no default options were bound, assign empty options object

    //override default options with request-level options
    this.options = Object.assign(
      {},
      this.options,
      controllerMethodAuthenticationMetadata.options
    );
  }

  extractCredentials(request: Request): string {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }

    // for example : Bearer xxx.yyy.zzz
    const authHeaderValue = request.headers.authorization;

    if (!authHeaderValue.startsWith('Bearer')) {
      throw new HttpErrors.Unauthorized(`Authorization header is not of type 'Bearer'.`);
    }

    //split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2)
      throw new HttpErrors.Unauthorized(
        `Authorization header is not valid. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`,
      );
    const token = parts[1];

    return token;
  }
}
