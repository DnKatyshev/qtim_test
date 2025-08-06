import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

describe('ArticleController', () => {
  let controller: ArticleController;
  let service: ArticleService;

  const mockArticleService = {
    findAll: jest.fn().mockResolvedValue([
      {
        id: 1,
        title: 'Mocked',
        description: 'Mocked desc',
        author: 'Mock Author',
        publishedAt: new Date(),
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService,
          useValue: mockArticleService,
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    service = module.get<ArticleService>(ArticleService);
  });

  it('should return articles from service', async () => {
    const result = await controller.getArticles({ author: 'Mock Author', chunk: 1 });
    expect(result).toHaveLength(1);
    expect(service.findAll).toHaveBeenCalledWith({ author: 'Mock Author', chunk: 1 }, 1);
  });
});
