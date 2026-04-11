import { useState } from 'react';
import { Button, Container, Form, Row, Col, Table } from 'react-bootstrap';
import './AdminPage.css';

// Dados iniciais de exemplo para o painel administrativo
const initialProducts = [
  {
    id: 1,
    name: 'Kit Amor',
    price: 149.9,
    stock: 8,
    description: 'Conjunto especial com peças artesanais e detalhes delicados.',
  },
  {
    id: 2,
    name: 'Laço Rosa',
    price: 39.9,
    stock: 15,
    description: 'Laço delicado para presentear ou complementar looks.',
  },
];

const initialOrders = [
  {
    id: 1,
    customer: 'Maria Pereira',
    items: 2,
    total: 189.8,
    status: 'Pendente',
  },
  {
    id: 2,
    customer: 'Ana Souza',
    items: 1,
    total: 39.9,
    status: 'Em produção',
  },
];

const initialUsers = [
  {
    id: 1,
    name: 'Camila Costa',
    role: 'Administrador',
  },
  {
    id: 2,
    name: 'Lívia Santos',
    role: 'Cliente',
  },
];

function AdminPage() {
  // Estado do painel: seção ativa e dados do admin
  const [activeSection, setActiveSection] = useState('dashboard');
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [users, setUsers] = useState(initialUsers);
  const [feedback, setFeedback] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
  });

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setFeedback('');
  };

  const handleNewProductChange = (field, value) => {
    setNewProduct((current) => ({ ...current, [field]: value }));
  };

  const handleAddProduct = (event) => {
    event.preventDefault();
    const { name, price, stock, description } = newProduct;

    if (!name.trim() || !price || !stock) {
      setFeedback('Por favor, preencha nome, preço e estoque para adicionar um produto.');
      return;
    }

    const product = {
      id: products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1,
      name: name.trim(),
      price: Number(price),
      stock: Number(stock),
      description: description.trim(),
    };

    setProducts((current) => [product, ...current]);
    setNewProduct({ name: '', price: '', stock: '', description: '' });
    setFeedback('Produto adicionado com sucesso.');
  };

  const handleRemoveProduct = (productId) => {
    setProducts((current) => current.filter((product) => product.id !== productId));
    setFeedback('Produto removido.');
  };

  const handleCompleteOrder = (orderId) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: 'Concluído' } : order
      )
    );
    setFeedback('Pedido atualizado para concluído.');
  };

  const handleRemoveOrder = (orderId) => {
    setOrders((current) => current.filter((order) => order.id !== orderId));
    setFeedback('Pedido removido.');
  };

  const handleRemoveUser = (userId) => {
    setUsers((current) => current.filter((user) => user.id !== userId));
    setFeedback('Usuário removido.');
  };

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <Row className="mb-4">
        <Col md={4}>
          <div className="admin-summary-card">
            <h3>Produtos</h3>
            <p>{products.length} item(s) cadastrados</p>
          </div>
        </Col>
        <Col md={4}>
          <div className="admin-summary-card">
            <h3>Pedidos</h3>
            <p>{orders.length} pedido(s) em sistema</p>
          </div>
        </Col>
        <Col md={4}>
          <div className="admin-summary-card">
            <h3>Usuários</h3>
            <p>{users.length} usuário(s) registrados</p>
          </div>
        </Col>
      </Row>
      <p>Use as abas acima para adicionar, remover ou atualizar produtos e visualizar pedidos.</p>
    </div>
  );

  const renderProductsSection = () => (
    <div className="admin-section">
      <h3>Gerenciar Produtos</h3>
      <p>Adicione novos produtos ao catálogo ou remova itens existentes.</p>
      <Form onSubmit={handleAddProduct} className="admin-form mb-4">
        <Row>
          <Col md={6} className="mb-3">
            <Form.Label>Nome do produto</Form.Label>
            <Form.Control
              type="text"
              value={newProduct.name}
              onChange={(e) => handleNewProductChange('name', e.target.value)}
              placeholder="Ex: Laço Rosa"
            />
          </Col>
          <Col md={3} className="mb-3">
            <Form.Label>Preço</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.1"
              value={newProduct.price}
              onChange={(e) => handleNewProductChange('price', e.target.value)}
              placeholder="R$ 0,00"
            />
          </Col>
          <Col md={3} className="mb-3">
            <Form.Label>Estoque</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={newProduct.stock}
              onChange={(e) => handleNewProductChange('stock', e.target.value)}
              placeholder="0"
            />
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Descrição</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={newProduct.description}
            onChange={(e) => handleNewProductChange('description', e.target.value)}
            placeholder="Descrição breve do produto"
          />
        </Form.Group>
        <Button type="submit" variant="primary">Adicionar produto</Button>
      </Form>

      <div className="admin-list">
        <h4>Produtos cadastrados</h4>
        <Table responsive bordered hover className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Produto</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Descrição</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{formatCurrency(product.price)}</td>
                <td>{product.stock}</td>
                <td>{product.description}</td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveProduct(product.id)}
                  >
                    Remover
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );

  const renderOrdersSection = () => (
    <div className="admin-section">
      <h3>Gerenciar Pedidos</h3>
      <p>Marque pedidos concluídos ou remova pedidos antigos.</p>
      <Table responsive bordered hover className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Itens</th>
            <th>Total</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.items}</td>
              <td>{formatCurrency(order.total)}</td>
              <td>{order.status}</td>
              <td className="admin-actions-cell">
                <Button
                  variant="success"
                  size="sm"
                  disabled={order.status === 'Concluído'}
                  onClick={() => handleCompleteOrder(order.id)}
                  className="me-2"
                >
                  Concluir
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveOrder(order.id)}
                >
                  Remover
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  const renderUsersSection = () => (
    <div className="admin-section">
      <h3>Gerenciar Usuários</h3>
      <p>Visualize usuários cadastrados e remova contas quando necessário.</p>
      <Table responsive bordered hover className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Função</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveUser(user.id)}
                >
                  Remover
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  return (
    <Container className="admin-page-container">
      <div className="admin-panel">
        <div className="admin-panel-top">
          <div>
            <h2>Administração</h2>
            <p>Bem-vindo à área de administração! Aqui você pode gerenciar produtos, pedidos e usuários.</p>
          </div>
          <div className="admin-buttons-group">
            <Button
              variant={activeSection === 'dashboard' ? 'dark' : 'outline-dark'}
              onClick={() => handleSectionChange('dashboard')}
            >
              Visão geral
            </Button>
            <Button
              variant={activeSection === 'products' ? 'dark' : 'outline-dark'}
              onClick={() => handleSectionChange('products')}
            >
              Produtos
            </Button>
            <Button
              variant={activeSection === 'orders' ? 'dark' : 'outline-dark'}
              onClick={() => handleSectionChange('orders')}
            >
              Pedidos
            </Button>
            <Button
              variant={activeSection === 'users' ? 'dark' : 'outline-dark'}
              onClick={() => handleSectionChange('users')}
            >
              Usuários
            </Button>
          </div>
        </div>

        {feedback && <div className="admin-feedback">{feedback}</div>}
        <div className="admin-content">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'products' && renderProductsSection()}
          {activeSection === 'orders' && renderOrdersSection()}
          {activeSection === 'users' && renderUsersSection()}
        </div>
      </div>
    </Container>
  );
}

export default AdminPage;
