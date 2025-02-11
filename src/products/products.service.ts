import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';
import { Order, OrderDocument } from 'src/orders/schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ProductsService {

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>
  ) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const result = new this.productModel(createProductDto);
    return result.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product | string | null> {
    // Validate ID and existence using a reusable function
    this.handleValidationResponse(await this.validateId(id));
    const result = await this.productModel.findById(id).exec();
    return result;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product | null> {
    // Validate ID and existence using a reusable function
    this.handleValidationResponse(await this.validateId(id));
    const result = this.productModel.findByIdAndUpdate(
      id, updateProductDto, { new: true } 
    ).exec();
    return result;
  }

  async remove(id: string) {
    // Validate ID and existence using a reusable function
    this.handleValidationResponse(await this.validateId(id));

    // Check if product is used in any orders
    const countOrders = await this.orderModel.countDocuments({productId: id});
    if (countOrders>0){
      throw new BadRequestException('Cannot delete product because it is referenced in some orders');
    }

    await this.productModel.findByIdAndDelete(id).exec();
    return { message: 'Delete product successful' };
  }

  // 🔹 Reusable function for checking ObjectId
  async validateId(id: string) {
    // 1️⃣ Validate if the ID format is correct
    if (!Types.ObjectId.isValid(id)) {
      // throw new BadRequestException('Invalid ID format');
      return '400';
    }

    // 2️⃣ Check if the product exists first
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      // throw new NotFoundException('ID not found');
      return '404';
    }

    return '200';
  }

  // 🔹 Reusable function for handling validation response
  handleValidationResponse(response: string) {
    switch (response) {
      case '400':
        throw new BadRequestException('Invalid product id format');
      case '404':
        throw new NotFoundException('Product id not found');
      default:
        return; // Continue execution
    }
  }
}
