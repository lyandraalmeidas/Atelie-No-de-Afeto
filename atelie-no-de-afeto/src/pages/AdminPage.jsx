import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Container } from 'react-bootstrap';
import './FormPage.css';

function AdminPage() {
    return (
        <Container className="form-page-container">
            <div className="form-page-wrapper">
                <h2 className="form-title">Administração</h2>
                <p className="form-text">Bem-vindo à área de administração! Aqui você pode gerenciar produtos, pedidos e usuários.</p>
                <div className="admin-actions">
                    <Button variant="primary" as={Link} to="/admin/produtos" className="admin-btn">Gerenciar Produtos</Button>
                    <Button variant="secondary" as={Link} to="/admin/pedidos" className="admin-btn">Gerenciar Pedidos</Button>
                    <Button variant="success" as={Link} to="/admin/usuarios" className="admin-btn">Gerenciar Usuários</Button>
                </div>
            </div>
        </Container>
    );
}