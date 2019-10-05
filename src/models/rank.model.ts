import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Game, GameWithRelations } from './game.model';

@model()
export class Rank extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  shortName?: string;

  @property({
    type: 'string',
  })
  avatar?: string;

  @belongsTo(() => Game)
  gameId: string;

  getId() {
    return this.id;
  }

  constructor(data?: Partial<Rank>) {
    super(data);
  }
}

export interface RankRelations {
  game?: GameWithRelations;
}

export type RankWithRelations = Rank & RankRelations;
