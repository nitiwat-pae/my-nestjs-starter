import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model } from 'mongoose';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrdersService {

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const productResult = await this.productsService.findOne(
      createOrderDto.productId
    );

    if(!productResult){
      throw new NotFoundException('Product id not found')
    }

    const result = new this.orderModel(createOrderDto);
    return result.save();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().populate('productId').exec();
  }

  async findOne(id: string): Promise<Order | null> {
    const order = this.orderModel.findById(id).populate('productId').exec();
    return order;
  }

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  // async remove(id: string) {
  //   await this.orderModel.findByIdAndDelete(id).exec();
  //   return 'Delete order successfully';
  // }
}
