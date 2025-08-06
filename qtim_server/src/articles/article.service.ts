import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FindArticlesDto } from './dto/find-articles.dto';
import { User } from '../users/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ArticleService {

  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateArticleDto, userId: number) {
    await this.userRepo.findOneByOrFail({ id: userId });

    const article = this.articleRepo.create(dto);
    const result = await this.articleRepo.save(article);

    await this.invalidateCache();

    return result;
  }

  async findAll(filter: FindArticlesDto, chunk?: number): Promise<Article[]> {
    const take = 3;
    const skip = chunk ? (chunk - 1) * take : 0;

    const cacheKey = this.buildCacheKey(filter, chunk);

    const cached = await this.cacheManager.get<Article[]>(cacheKey);
    if (cached) return cached;

    const query = this.articleRepo.createQueryBuilder('article');

    if (filter.author) {
      query.andWhere('article.author = :author', { author: filter.author });
    }

    if (filter.fromDate) {
      query.andWhere('article.publishedAt >= :fromDate', { fromDate: filter.fromDate });
    }

    if (filter.toDate) {
      query.andWhere('article.publishedAt <= :toDate', { toDate: filter.toDate });
    }

    query.skip(skip).take(take);

    const result = await query.getMany();
    await this.cacheManager.set(cacheKey, result);

    return result;
  }

  async findOne(id: number) {
    const cacheKey = `article:${id}`;
    const cached = await this.cacheManager.get<Article>(cacheKey);
    if (cached) return cached;

    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');

    await this.cacheManager.set(cacheKey, article);
    return article;
  }

  async update(id: number, dto: UpdateArticleDto) {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');

    Object.assign(article, dto);
    const updated = await this.articleRepo.save(article);

    await this.invalidateCache(id);
    return updated;
  }

  async delete(id: number) {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');

    const removed = await this.articleRepo.remove(article);
    await this.invalidateCache(id);

    return removed;
  }

  // Метод используется, например, после обновления/удаления статьи
  private async invalidateCache(articleId?: number) {
    // Удаляем все известные ключи по одному
    const keys = ['articles:*'];
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
    
    if (articleId) {
      await this.cacheManager.del(`article:${articleId}`);
    }
  }

  // Метод формирует уникальный ключ для кэширования списка статей
  private buildCacheKey(filter: FindArticlesDto, chunk?: number): string {
    const author = filter.author || 'any';
    const fromDate = filter.fromDate || 'none';
    const toDate = filter.toDate || 'none';
    const ch = chunk || '1';

    return `articles:author=${author}:from=${fromDate}:to=${toDate}:chunk=${ch}`;
  }
}