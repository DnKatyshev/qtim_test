import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Query,
    Patch,
    Delete,
    UseGuards,
    Request,
    ParseIntPipe,
    ValidationPipe
  } from '@nestjs/common';
  import { ArticleService } from './article.service';
  import { CreateArticleDto } from './dto/create-article.dto';
  import { UpdateArticleDto } from './dto/update-article.dto';
  import { FindArticlesDto } from './dto/find-articles.dto';
  import { AuthGuard } from '@nestjs/passport';
  
  @Controller('articles')
  export class ArticleController {
    constructor(private readonly service: ArticleService) {}
  
    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() dto: CreateArticleDto, @Request() req) {
      return this.service.create(dto, req.user.sub);
    }
  
    @Get()
    getArticles(
      @Query(new ValidationPipe({ transform: true })) query: FindArticlesDto,
    ) {
      return this.service.findAll(query, query.chunk);
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.service.findOne(id);
    }
  
    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto) {
      return this.service.update(id, dto);
    }
  
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.service.delete(id);
    }
  }  