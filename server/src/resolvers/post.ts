import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { LessThan } from 'typeorm';
import { Post } from '../entities/Post';
import { isAuth } from '../middleware/auth';
import { ResolverContext } from '../types';
import * as Util from '../utils';

@InputType()
export class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textPreview(@Root() root: Post) {
    return Util.abbreviate(root.text, 50);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    // Fetch one more post to find out if it has more
    const queryLimit = Util.range(0, 50, limit) + 1;

    // TODO: I should use the query builder instead.
    const posts = await Post.find({
      order: { createdAt: 'DESC' },
      take: queryLimit,
      relations: ['creator'],
      where: !cursor
        ? undefined
        : { createdAt: LessThan(new Date(parseInt(cursor))) },
    });

    return {
      // The length of posts need to be called before we slice it
      hasMore: posts.length === queryLimit,
      posts: posts.slice(0, queryLimit - 1),
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id') id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: ResolverContext
  ): Promise<Post> {
    const post = await Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();

    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);

    if (!post) {
      return null;
    }

    if (typeof title !== 'undefined') {
      post.title = title;
      Post.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    const result = await Post.delete(id);
    return !!result.affected;
  }
}
