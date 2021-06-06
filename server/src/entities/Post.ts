import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { User } from './User';
import { Updoot } from './Updoot';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: 'int', default: 0 })
  votes!: number;

  @Field()
  @Column()
  creatorId!: number;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null;

  // TODO: Not all resolvers should return the creator relation.
  @Field()
  @JoinColumn()
  @ManyToOne(() => User, (user) => user.posts)
  creator!: User;

  @JoinColumn()
  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots!: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt!: Date;
}
