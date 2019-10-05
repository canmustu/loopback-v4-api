import { Entity, model, property, hasMany } from '@loopback/repository';
import { Rank, RankWithRelations } from './rank.model';

@model()
export class Game extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
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

  @hasMany<Rank>(() => Rank)
  ranks?: Rank[];

  constructor(data?: Partial<Game>) {
    super(data);
  }
}

export interface GameRelations {
  ranks?: RankWithRelations[];
}

export type GameWithRelations = Game & GameRelations;
