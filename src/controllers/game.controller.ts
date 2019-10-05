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
import { Game, Rank, RankRelations } from '../models';
import { GameRepository, RankRepository } from '../repositories';

export class GameController {
  constructor(
    @repository(GameRepository) public gameRepository: GameRepository,
    @repository(RankRepository) public rankRepository: RankRepository,
  ) { }

  @post('/games')
  async create(@requestBody() game: Game): Promise<Game> {
    return await this.gameRepository.create(game);
  }

  @get('/games/count')
  async count(
    @param.query.object('where', getWhereSchemaFor(Game)) where?: Where<Game>,
  ): Promise<Count> {
    return await this.gameRepository.count(where);
  }

  @get('/games')
  async find(
    @param.query.object('filter', getFilterSchemaFor(Game)) filter?: Filter<Game>,
  ): Promise<Game[]> {
    return await this.gameRepository.find(filter);
  }

  @patch('/games')
  async updateAll(
    @requestBody() game: Game,
    @param.query.object('where', getWhereSchemaFor(Game)) where?: Where<Game>,
  ): Promise<Count> {
    return await this.gameRepository.updateAll(game, where);
  }

  @get('/games/{id}')
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(Game)) filter?: Filter<Game>,
  ): Promise<Game> {
    return await this.gameRepository.findById(id, { include: [{ relation: 'ranks' }] });
  }

  @patch('/games/{id}')
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() game: Game,
  ): Promise<void> {
    await this.gameRepository.updateById(id, game);
  }

  @put('/games/{id}')
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() game: Game,
  ): Promise<void> {
    await this.gameRepository.replaceById(id, game);
  }

  @del('/games/{id}')
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.gameRepository.deleteById(id);
  }

  @post('/games/{id}/rank')
  async createRank(
    @param.path.string('id') gameId: typeof Rank.prototype.id,
    @requestBody() rank: Rank,
  ): Promise<Rank> {
    return this.gameRepository.ranks(gameId).create(rank);
  }

  @get('/games/{id}/rank')
  async createOrder(
    @param.path.string('id') gameId: typeof Rank.prototype.id
  ): Promise<Rank[]> {
    return this.gameRepository.ranks(gameId).find();
  }
}
