import { repository } from '@loopback/repository';
import { validateCredentials } from '../services/validator';
import { post, param, get, requestBody, HttpErrors } from '@loopback/rest';
import { User } from '../models';
import { UserRepository } from '../repositories';
import { inject } from '@loopback/core';
import {
  authenticate,
  TokenService,
} from '@loopback/authentication';
import { UserProfile, securityId, SecurityBindings } from '@loopback/security';
import {
  CredentialsRequestBody
} from './specs/user-controller.specs';
import { Credentials } from '../repositories/user.repository';
import { PasswordHasher } from '../services/hash.password.bcryptjs';
import {
  TokenServiceBindings,
  PasswordHasherBindings,
  UserServiceBindings,
} from '../keys';
import * as _ from 'lodash';
import { IMyUserService } from '../services/user-service';

export class UserController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE) public userService: IMyUserService<User, Credentials>
  ) { }

  @post('/users')
  async create(@requestBody() user: User): Promise<User> {
    // ensure a valid email value and password value
    validateCredentials(_.pick(user, ['email', 'password']));

    // encrypt the password
    user.password = await this.passwordHasher.hashPassword(user.password);

    try {
      // create the new user
      const savedUser = await this.userRepository.create(user);
      delete savedUser.password;
      return savedUser;
    } catch (error) {
      // MongoError 11000 duplicate key
      if (error.code === 11000 && error.errmsg.includes('index: uniqueEmail')) {
        throw new HttpErrors.Conflict('Email value is already taken');
      } else {
        throw error;
      }
    }
  }

  @get('/users/{userId}')
  async findById(@param.path.string('userId') userId: string): Promise<User> {
    return this.userRepository.findById(userId, {
      fields: { password: false },
    });
  }

  @authenticate('jwt', { roles: ['selam'] })
  @get('/users/me')
  async printCurrentUser(@inject(SecurityBindings.USER) currentUserProfile: UserProfile): Promise<UserProfile> {
    currentUserProfile.id = currentUserProfile[securityId];
    delete currentUserProfile[securityId];
    return currentUserProfile;
  }

  @post('/users/login')
  async login(@requestBody(CredentialsRequestBody) credentials: Credentials): Promise<{ token: string }> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    return { token };
  }
}
