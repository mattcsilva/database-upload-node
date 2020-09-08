import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({ title, value, type, category: categoryName }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (total < value) {
        throw new AppError('Insufficient balance!');
      }
    }

    const categoriesRepository = getRepository(Category);

    let category = await categoriesRepository.findOne({ where: { title: categoryName } });
    
    if(!category) {
      category = categoriesRepository.create({
        title: categoryName
      });

      categoriesRepository.save(category);
    }
    
    const transaction = transactionsRepository.create({
      title,
      value,
      category_id: category.id,
      type,
    });

    transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
