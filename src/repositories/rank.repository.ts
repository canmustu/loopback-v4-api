import { DefaultCrudRepository, BelongsToAccessor, repository } from '@loopback/repository';
import { Rank, RankRelations, Game } from '../models';
import { MongoDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { GameRepository } from './game.repository';

export class RankRepository extends DefaultCrudRepository<
  Rank,
  typeof Rank.prototype.id,
  RankRelations
  > {

  public readonly game: BelongsToAccessor<
    Game,
    typeof Game.prototype.id
  >;

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository.getter('GameRepository') protected gameRepositoryGetter: Getter<GameRepository>,
  ) {
    super(Rank, dataSource);

    this.game = this.createBelongsToAccessorFor(
      'game',
      gameRepositoryGetter,
    );
    this.registerInclusionResolver('game', this.game.inclusionResolver);
  }
}
