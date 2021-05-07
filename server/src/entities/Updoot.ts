import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { Post } from './Post';
import { User } from './User';

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @PrimaryColumn()
  userId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.updoots)
  user!: User;

  @Field()
  @PrimaryColumn()
  postId!: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (user) => user.updoots)
  post!: Post;

  @Field()
  @Column({ type: 'int' })
  value: number;
  // @Field(() => String)
  // @CreateDateColumn()
  // createdAt!: Date;

  // @Field(() => String)
  // @UpdateDateColumn()
  // updatedAt!: Date;
}
