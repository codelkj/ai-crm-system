/**
 * Category Controller
 */

import { Request, Response } from 'express';
import categoryService from '../services/category.service';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../types/financial.types';

class CategoryController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query;

      let categories;
      if (type === 'income' || type === 'expense') {
        categories = await categoryService.getByType(type);
      } else {
        categories = await categoryService.getAll();
      }

      res.json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await categoryService.getById(id);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch category',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateCategoryDTO = req.body;
      const category = await categoryService.create(data);

      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create category',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateCategoryDTO = req.body;
      const category = await categoryService.update(id, data);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      res.json({
        success: true,
        data: category,
        message: 'Category updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update category',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await categoryService.delete(id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete category',
      });
    }
  }
}

export default new CategoryController();
