import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import { Rank } from '../models';
import { RankRepository } from '../repositories';

export class RankController {
  constructor(
    @repository(RankRepository)
    public rankRepository: RankRepository,
  ) { }

  @post('/ranks', {
    responses: {
      '200': {
        description: 'Rank model instance',
        content: { 'application/json': { schema: { 'x-ts-type': Rank } } },
      },
    },
  })
  async create(@requestBody() rank: Rank): Promise<Rank> {
    return await this.rankRepository.create(rank);
  }

  @get('/ranks/count', {
    responses: {
      '200': {
        description: 'Rank model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Rank)) where?: Where<Rank>,
  ): Promise<Count> {
    return await this.rankRepository.count(where);
  }

  @get('/ranks', {
    responses: {
      '200': {
        description: 'Array of Rank model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Rank } },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Rank)) filter?: Filter<Rank>,
  ): Promise<Rank[]> {
    return await this.rankRepository.find(filter);
  }

  @patch('/ranks', {
    responses: {
      '200': {
        description: 'Rank PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody() rank: Rank,
    @param.query.object('where', getWhereSchemaFor(Rank)) where?: Where<Rank>,
  ): Promise<Count> {
    return await this.rankRepository.updateAll(rank, where);
  }

  @get('/ranks/{id}', {
    responses: {
      '200': {
        description: 'Rank model instance',
        content: { 'application/json': { schema: { 'x-ts-type': Rank } } },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Rank> {
    return await this.rankRepository.findById(id, { include: [{ relation: 'game', scope: {} }] });
  }

  @patch('/ranks/{id}', {
    responses: {
      '204': {
        description: 'Rank PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() rank: Rank,
  ): Promise<void> {
    await this.rankRepository.updateById(id, rank);
  }

  @put('/ranks/{id}', {
    responses: {
      '204': {
        description: 'Rank PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() rank: Rank,
  ): Promise<void> {
    await this.rankRepository.replaceById(id, rank);
  }

  @del('/ranks/{id}', {
    responses: {
      '204': {
        description: 'Rank DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.rankRepository.deleteById(id);
  }
}
