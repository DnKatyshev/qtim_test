import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ArticleService', () => {
  let service: ArticleService;
  let repo: Repository<Article>;

  const mockArticleRepo = {
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          title: 'Test Article',
          description: 'Test Description',
          author: 'John Doe',
          publishedAt: new Date(),
        },
      ]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockArticleRepo,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    repo = module.get<Repository<Article>>(getRepositoryToken(Article));
  });

  it('should return filtered articles', async () => {
    const result = await service.findAll({ author: 'John Doe' }, 1);
    expect(result).toHaveLength(1);
    expect(mockArticleRepo.createQueryBuilder).toHaveBeenCalled();
  });
});
