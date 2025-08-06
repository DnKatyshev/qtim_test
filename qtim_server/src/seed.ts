import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Article } from './articles/article.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
  
    const userRepo = dataSource.getRepository(User);
    const articleRepo = dataSource.getRepository(Article);
  
    await articleRepo.clear();
    await userRepo.clear();
  
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = userRepo.create({
      email: 'admin@example.com',
      password: hashedPassword,
    });
    await userRepo.save(user);

    const articles = [
        {
            title: 'NestJS Introduction',
            description: 'Learn the basics of NestJS...',
            author: 'John Smith',
            publishedAt: new Date('2024-01-10'),
        },
        {
            title: 'Advanced TypeORM',
            description: 'Master advanced TypeORM features...',
            author: 'Alice Johnson',
            publishedAt: new Date('2024-02-15'),
        },
        {
            title: 'Understanding DI',
            description: 'A deep dive into DI in NestJS...',
            author: 'John Smith',
            publishedAt: new Date('2024-03-05'),
        },
        {
            title: 'REST vs GraphQL',
            description: 'Comparison of RESTful APIs and GraphQL...',
            author: 'Emma Davis',
            publishedAt: new Date('2024-04-01'),
        },
        {
            title: 'Unit Testing in NestJS',
            description: 'How to write unit tests...',
            author: 'Alice Johnson',
            publishedAt: new Date('2024-04-20'),
        },
        {
            title: 'Building a CLI with Node.js',
            description: 'Guide to building CLI tools...',
            author: 'Robert Brown',
            publishedAt: new Date('2024-05-10'),
        },
        {
            title: 'React + NestJS',
            description: 'How to combine React & NestJS...',
            author: 'John Smith',
            publishedAt: new Date('2024-06-01'),
        },
        {
            title: 'JWT Auth in NestJS',
            description: 'Secure your app with JWT...',
            author: 'Michael Green',
            publishedAt: new Date('2024-06-15'),
        },
        {
            title: 'Rate Limiting in APIs',
            description: 'Prevent abuse with rate limits...',
            author: 'Emma Davis',
            publishedAt: new Date('2024-07-01'),
        },
        {
            title: 'MongoDB vs PostgreSQL',
            description: 'Comparing two databases...',
            author: 'Robert Brown',
            publishedAt: new Date('2024-07-20'),
        },
    ];


    for (const articleData of articles) {
        const article = articleRepo.create(articleData);
        await articleRepo.save(article);
    }

    await app.close();
}

bootstrap();