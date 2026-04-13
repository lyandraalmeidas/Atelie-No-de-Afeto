import { CartRepository } from '../repositories/cart.repository';
import { ProductRepository } from '../repositories/product.repository';
import { AppError } from '../utils/AppError';

export class CartService {
  private cartRepo    = new CartRepository();
  private productRepo = new ProductRepository();

  async getCart(userId: string) {
    return this.cartRepo.findOrCreate(userId);
  }

  async addItem(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) throw new AppError('Quantidade deve ser maior que zero.', 400);

    const product = await this.productRepo.findById(productId);
    if (!product) throw new AppError('Produto não encontrado.', 404);
    if (product.stock === 0) throw new AppError(`"${product.name}" está esgotado.`, 400);

    // faz a soma do que está no carrinho
    const cart = await this.cartRepo.findOrCreate(userId);
    const existing = cart.items.find((i: { productId: string }) => i.productId === productId);
    const currentQty = existing?.quantity ?? 0;

    if (currentQty + quantity > product.stock) {
      throw new AppError(
        `Estoque insuficiente para "${product.name}". Disponível: ${product.stock - currentQty}.`,
        400
      );
    }

    return this.cartRepo.upsertItem(userId, productId, quantity);
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    if (quantity < 0) throw new AppError('Quantidade não pode ser negativa.', 400);
    if (quantity === 0) return this.cartRepo.removeItem(userId, productId);

    const product = await this.productRepo.findById(productId);
    if (!product) throw new AppError('Produto não encontrado.', 404);

    if (quantity > product.stock) {
      throw new AppError(
        `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}.`,
        400
      );
    }

    return this.cartRepo.updateItemQuantity(userId, productId, quantity);
  }

  async removeItem(userId: string, productId: string) {
    return this.cartRepo.removeItem(userId, productId);
  }

  async clear(userId: string) {
    return this.cartRepo.clear(userId);
  }
}