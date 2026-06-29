import {
  ForbiddenException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from './../src/app.config';
import { AppModule } from './../src/app.module';
import { CommentsService } from './../src/comments/comments.service';
import { CreateCommentDto } from './../src/comments/dto/create-comment.dto';
import { UpdateCommentDto } from './../src/comments/dto/update-comment.dto';

type CommentRecord = Awaited<ReturnType<CommentsService['createComment']>>;

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

const author = {
  id: '8b2777e0-0f29-4c73-8708-9c27f98d34aa',
  username: 'z1gonzo',
  displayName: 'Łukasz',
  avatarUrl: 'https://example.com/avatar.png',
  isPrivate: false,
};

const comment: CommentRecord = {
  id: 'c3afc5cb-4bfb-4f13-8901-3b3d86b57f75',
  postId: '1f2557e7-96d8-46a6-95c7-b6790f595c85',
  authorId: author.id,
  content: 'Great post',
  createdAt: new Date('2026-06-29T16:00:00.000Z'),
  updatedAt: new Date('2026-06-29T16:00:00.000Z'),
  author,
};

const newerComment: CommentRecord = {
  ...comment,
  id: '84dcc826-9f0e-47d8-a0d6-bd4136ce5c47',
  content: 'Thanks for sharing',
  createdAt: new Date('2026-06-29T16:01:00.000Z'),
  updatedAt: new Date('2026-06-29T16:01:00.000Z'),
};

const updatedComment: CommentRecord = {
  ...comment,
  content: 'Edited comment',
  updatedAt: new Date('2026-06-29T16:02:00.000Z'),
};

describe('CommentsController (e2e)', () => {
  let app: INestApplication<App>;
  let commentsService: {
    createComment: jest.Mock<
      Promise<CommentRecord>,
      [string, string, CreateCommentDto]
    >;
    listComments: jest.Mock<
      Promise<CommentRecord[]>,
      [{ postId: string; limit: number; offset: number }]
    >;
    updateOwnComment: jest.Mock<
      Promise<CommentRecord>,
      [string, string, UpdateCommentDto]
    >;
    deleteOwnComment: jest.Mock<Promise<CommentRecord>, [string, string]>;
  };
  let jwtService: {
    verifyAsync: jest.Mock<Promise<JwtPayload>, [string]>;
  };

  beforeEach(async () => {
    commentsService = {
      createComment: jest.fn<
        Promise<CommentRecord>,
        [string, string, CreateCommentDto]
      >(),
      listComments: jest.fn<
        Promise<CommentRecord[]>,
        [{ postId: string; limit: number; offset: number }]
      >(),
      updateOwnComment: jest.fn<
        Promise<CommentRecord>,
        [string, string, UpdateCommentDto]
      >(),
      deleteOwnComment: jest.fn<Promise<CommentRecord>, [string, string]>(),
    };
    jwtService = {
      verifyAsync: jest.fn<Promise<JwtPayload>, [string]>(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CommentsService)
      .useValue(commentsService)
      .overrideProvider(JwtService)
      .useValue(jwtService)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /posts/:postId/comments creates a comment for the current user', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    commentsService.createComment.mockResolvedValue(comment);

    const response = await request(app.getHttpServer())
      .post(`/posts/${comment.postId}/comments`)
      .set('authorization', 'Bearer signed-access-token')
      .send({ content: 'Great post' })
      .expect(201);

    expect(commentsService.createComment).toHaveBeenCalledWith(
      comment.postId,
      author.id,
      { content: 'Great post' },
    );
    expect(response.body).toMatchObject({
      id: comment.id,
      postId: comment.postId,
      content: 'Great post',
      author: { id: author.id, username: 'z1gonzo' },
    });
    expect(response.body).not.toHaveProperty('author.email');
    expect(response.body).not.toHaveProperty('author.passwordHash');
  });

  it('POST /posts/:postId/comments rejects requests without a bearer token', async () => {
    await request(app.getHttpServer())
      .post(`/posts/${comment.postId}/comments`)
      .send({ content: 'Great post' })
      .expect(401);

    expect(commentsService.createComment).not.toHaveBeenCalled();
  });

  it('POST /posts/:postId/comments rejects invalid content', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });

    await request(app.getHttpServer())
      .post(`/posts/${comment.postId}/comments`)
      .set('authorization', 'Bearer signed-access-token')
      .send({ content: '', unexpectedField: 'rejected' })
      .expect(400);

    expect(commentsService.createComment).not.toHaveBeenCalled();
  });

  it('POST /posts/:postId/comments returns 404 for missing posts', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    commentsService.createComment.mockRejectedValue(
      new NotFoundException('Post not found'),
    );

    await request(app.getHttpServer())
      .post(`/posts/${comment.postId}/comments`)
      .set('authorization', 'Bearer signed-access-token')
      .send({ content: 'Great post' })
      .expect(404);
  });

  it('GET /posts/:postId/comments returns comments with default pagination', async () => {
    commentsService.listComments.mockResolvedValue([comment, newerComment]);

    const response = await request(app.getHttpServer())
      .get(`/posts/${comment.postId}/comments`)
      .expect(200);

    expect(commentsService.listComments).toHaveBeenCalledWith({
      postId: comment.postId,
      limit: 20,
      offset: 0,
    });
    expect(response.body).toMatchObject([
      { id: comment.id, content: 'Great post' },
      { id: newerComment.id, content: 'Thanks for sharing' },
    ]);
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('GET /posts/:postId/comments passes limit and offset to the service', async () => {
    commentsService.listComments.mockResolvedValue([comment]);

    await request(app.getHttpServer())
      .get(`/posts/${comment.postId}/comments?limit=1&offset=1`)
      .expect(200);

    expect(commentsService.listComments).toHaveBeenCalledWith({
      postId: comment.postId,
      limit: 1,
      offset: 1,
    });
  });

  it('GET /posts/:postId/comments rejects invalid pagination query params', async () => {
    await request(app.getHttpServer())
      .get(`/posts/${comment.postId}/comments?limit=51`)
      .expect(400);
    await request(app.getHttpServer())
      .get(`/posts/${comment.postId}/comments?offset=-1`)
      .expect(400);

    expect(commentsService.listComments).not.toHaveBeenCalled();
  });

  it('PATCH /comments/:id updates the current user comment', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    commentsService.updateOwnComment.mockResolvedValue(updatedComment);

    const response = await request(app.getHttpServer())
      .patch(`/comments/${comment.id}`)
      .set('authorization', 'Bearer signed-access-token')
      .send({ content: 'Edited comment' })
      .expect(200);

    expect(commentsService.updateOwnComment).toHaveBeenCalledWith(
      comment.id,
      author.id,
      { content: 'Edited comment' },
    );
    expect(response.body).toMatchObject({
      id: comment.id,
      content: 'Edited comment',
    });
  });

  it('PATCH /comments/:id rejects requests without a bearer token', async () => {
    await request(app.getHttpServer())
      .patch(`/comments/${comment.id}`)
      .send({ content: 'Edited comment' })
      .expect(401);

    expect(commentsService.updateOwnComment).not.toHaveBeenCalled();
  });

  it('PATCH /comments/:id rejects invalid content', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });

    await request(app.getHttpServer())
      .patch(`/comments/${comment.id}`)
      .set('authorization', 'Bearer signed-access-token')
      .send({ content: '', unexpectedField: 'rejected' })
      .expect(400);

    expect(commentsService.updateOwnComment).not.toHaveBeenCalled();
  });

  it('PATCH /comments/:id returns 403 when editing another author comment', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: '00000000-0000-0000-0000-000000000000',
      email: 'other@example.com',
      username: 'otheruser',
    });
    commentsService.updateOwnComment.mockRejectedValue(
      new ForbiddenException('You can only modify your own comments'),
    );

    await request(app.getHttpServer())
      .patch(`/comments/${comment.id}`)
      .set('authorization', 'Bearer signed-access-token')
      .send({ content: 'Edited comment' })
      .expect(403);
  });

  it('PATCH /comments/:id returns 404 for a missing comment', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    commentsService.updateOwnComment.mockRejectedValue(
      new NotFoundException('Comment not found'),
    );

    await request(app.getHttpServer())
      .patch(`/comments/${comment.id}`)
      .set('authorization', 'Bearer signed-access-token')
      .send({ content: 'Edited comment' })
      .expect(404);
  });

  it('DELETE /comments/:id deletes the current user comment', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    commentsService.deleteOwnComment.mockResolvedValue(comment);

    await request(app.getHttpServer())
      .delete(`/comments/${comment.id}`)
      .set('authorization', 'Bearer signed-access-token')
      .expect(204)
      .expect('');

    expect(commentsService.deleteOwnComment).toHaveBeenCalledWith(
      comment.id,
      author.id,
    );
  });

  it('DELETE /comments/:id rejects requests without a bearer token', async () => {
    await request(app.getHttpServer())
      .delete(`/comments/${comment.id}`)
      .expect(401);

    expect(commentsService.deleteOwnComment).not.toHaveBeenCalled();
  });

  it('DELETE /comments/:id returns 403 when deleting another author comment', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: '00000000-0000-0000-0000-000000000000',
      email: 'other@example.com',
      username: 'otheruser',
    });
    commentsService.deleteOwnComment.mockRejectedValue(
      new ForbiddenException('You can only modify your own comments'),
    );

    await request(app.getHttpServer())
      .delete(`/comments/${comment.id}`)
      .set('authorization', 'Bearer signed-access-token')
      .expect(403);
  });

  it('DELETE /comments/:id returns 404 for a missing comment', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: author.id,
      email: 'lukasz@example.com',
      username: 'z1gonzo',
    });
    commentsService.deleteOwnComment.mockRejectedValue(
      new NotFoundException('Comment not found'),
    );

    await request(app.getHttpServer())
      .delete(`/comments/${comment.id}`)
      .set('authorization', 'Bearer signed-access-token')
      .expect(404);
  });
});
