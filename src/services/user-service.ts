import { HttpErrors } from '@loopback/rest';
import { Credentials, UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';
import { UserService } from '@loopback/authentication';
import { UserProfile, securityId } from '@loopback/security';
import { repository } from '@loopback/repository';
import { PasswordHasher } from './hash.password.bcryptjs';
import { PasswordHasherBindings } from '../keys';
import { inject } from '@loopback/context';
import { RoleControlType } from '../shared/role-control-type';

export interface IMyUserService<M, T> extends UserService<M, T> {
  verifyAuthorization(user: UserProfile, requiredRoles: string[], roleControlType: string): Promise<boolean>;
}

export class MyUserService implements IMyUserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) { }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.userRepository.findOne({
      where: { email: credentials.email },
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }
    const passwordMatched = await this.passwordHasher.comparePassword(
      credentials.password,
      foundUser.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  async verifyAuthorization(user: UserProfile, requiredRoles: string[], roleControlType: string): Promise<boolean> {

    console.log(user)
    console.log(requiredRoles)
    
    // check there is no any required role
    if (!requiredRoles || !requiredRoles.length) {
      return true;
    }

    // check user roles exist or not
    if (!user.roles || !user.roles.length) {
      return false;
    }

    let isAuthorized = false;

    // getting user roles
    const userRoles: string[] = user.roles || [];

    if (roleControlType === RoleControlType.ANY) {
      isAuthorized = userRoles.some(userRole => requiredRoles.findIndex(requiredRole => requiredRole === userRole) !== -1);
    } else if (roleControlType === RoleControlType.ALL) {
      isAuthorized = userRoles.every(userRole => requiredRoles.findIndex(requiredRole => requiredRole === userRole) !== -1);
    }

    console.log('user roles : ', user.roles);
    console.log('requiredRoles : ', requiredRoles);

    // if provided
    return isAuthorized;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles
    };
  }
}
