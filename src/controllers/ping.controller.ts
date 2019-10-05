

import { Request, RestBindings, get, ResponseObject } from '@loopback/rest';
import { inject } from '@loopback/context';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { authenticate } from '@loopback/authentication';
import { RoleControlType } from '../shared/role-control-type';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          greeting: { type: 'string' },
          date: { type: 'string' },
          url: { type: 'string' },
          headers: {
            type: 'object',
            properties: {
              'Content-Type': { type: 'string' },
            },
            additionalProperties: false,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
  ) { }

  @authenticate('jwt', { roles: ['ADMIN'] })
  @get('/ping')
  ping(@inject(SecurityBindings.USER) currentUserProfile: UserProfile): object {
    return currentUserProfile;
  }

  @authenticate('jwt', { roles: ['SUPER_ADMIN'], roleControlType: RoleControlType.ALL })
  @get('/ping2')
  ping2(@inject(SecurityBindings.USER) currentUserProfile: UserProfile): object {
    return currentUserProfile;
  }

  @authenticate('jwt', { roles: [] })
  @get('/ping3')
  ping3(@inject(SecurityBindings.USER) currentUserProfile: UserProfile): object {
    return currentUserProfile;
  }

  @authenticate('jwt')
  @get('/ping4')
  ping4(@inject(SecurityBindings.USER) currentUserProfile: UserProfile): object {
    return currentUserProfile;
  }
}
