import { DefaultCrudRepository, repository, HasManyRepositoryFactory } from '@loopback/repository';
import { Game, GameRelations, Rank } from '../models';
import { MongoDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { RankRepository } from './rank.repository';

export class GameRepository extends DefaultCrudRepository<Game, typeof Game.prototype.id, GameRelations> {

  public readonly ranks: HasManyRepositoryFactory<
    Rank,
    typeof Rank.prototype.id
  >;

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository.getter('RankRepository') protected rankRepositoryGetter: Getter<RankRepository>,
  ) {
    super(Game, dataSource);

    this.ranks = this.createHasManyRepositoryFactoryFor('ranks', rankRepositoryGetter);
    this.registerInclusionResolver('ranks', this.ranks.inclusionResolver);
  }
}
