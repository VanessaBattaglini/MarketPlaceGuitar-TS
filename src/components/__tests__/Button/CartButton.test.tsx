/**
 * Tests para el componente CartButton
 * Valida rendering, acciones y accesibilidad
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartButton from '../../Button/CartButton';

describe('CartButton', () => {
  describe('Rendering básico', () => {
    it('debe renderizar botón con variante add', () => {
      const handleClick = vi.fn();
      render(
        <CartButton variant="add" onClick={handleClick} />
      );

      const button = screen.getByRole('button', {
        name: /agregar guitarra al carrito/i,
      });
      expect(button).toBeInTheDocument();
    });

    it('debe renderizar botón con variante remove', () => {
      const handleClick = vi.fn();
      render(
        <CartButton variant="remove" onClick={handleClick} />
      );

      const button = screen.getByRole('button', {
        name: /remover del carrito/i,
      });
      expect(button).toBeInTheDocument();
    });

    it('debe renderizar botón con variante increase', () => {
      const handleClick = vi.fn();
      render(
        <CartButton variant="increase" onClick={handleClick} />
      );

      const button = screen.getByRole('button', {
        name: /aumentar cantidad/i,
      });
      expect(button).toBeInTheDocument();
    });

    it('debe renderizar botón con variante decrease', () => {
      const handleClick = vi.fn();
      render(
        <CartButton variant="decrease" onClick={handleClick} />
      );

      const button = screen.getByRole('button', {
        name: /disminuir cantidad/i,
      });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Contenido personalizado', () => {
    it('debe mostrar contenido personalizado', () => {
      const handleClick = vi.fn();
      render(
        <CartButton variant="add" onClick={handleClick}>
          Contenido personalizado
        </CartButton>
      );

      expect(screen.getByText('Contenido personalizado')).toBeInTheDocument();
    });

    it('debe mostrar label por defecto si no hay children', () => {
      const handleClick = vi.fn();
      render(
        <CartButton variant="add" onClick={handleClick} />
      );

      expect(
        screen.getByText('Agregar al Carrito')
      ).toBeInTheDocument();
    });
  });

  describe('Interacción', () => {
    it('debe llamar onClick cuando se hace clic', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(
        <CartButton variant="add" onClick={handleClick} />
      );

      const button = screen.getByRole('button', {
        name: /agregar guitarra al carrito/i,
      });
      
      await user.click(button);
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('no debe llamar onClick si está deshabilitado', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(
        <CartButton
          variant="add"
          onClick={handleClick}
          disabled={true}
        />
      );

      const button = screen.getByRole('button', {
        name: /agregar guitarra al carrito/i,
      });
      
      expect(button).toBeDisabled();
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Clases CSS', () => {
    it('debe aplicar clases por defecto para cada variante', () => {
      const handleClick = vi.fn();
      
      const { rerender } = render(
        <CartButton variant="add" onClick={handleClick} />
      );

      let button = screen.getByRole('button');
      expect(button).toHaveClass('btn', 'btn-dark', 'w-100');

      rerender(
        <CartButton variant="remove" onClick={handleClick} />
      );

      button = screen.getByRole('button');
      expect(button).toHaveClass('btn', 'btn-danger');
    });

    it('debe agregar clase CSS personalizada', () => {
      const handleClick = vi.fn();
      render(
        <CartButton
          variant="add"
          onClick={handleClick}
          className="custom-class"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener aria-label descriptivo', () => {
      const handleClick = vi.fn();
      render(
        <CartButton variant="add" onClick={handleClick} />
      );

      const button = screen.getByRole('button', {
        name: /agregar guitarra al carrito/i,
      });
      expect(button).toHaveAttribute(
        'aria-label',
        'Agregar guitarra al carrito'
      );
    });

    it('debe ser accesible por teclado', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(
        <CartButton variant="add" onClick={handleClick} />
      );

      const button = screen.getByRole('button');
      button.focus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('debe tener type="button"', () => {
      const handleClick = vi.fn();
      render(
        <CartButton variant="add" onClick={handleClick} />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Estados especiales', () => {
    it('debe renderizar correctamente cuando está deshabilitado', () => {
      const handleClick = vi.fn();
      render(
        <CartButton
          variant="add"
          onClick={handleClick}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('debe renderizar correctamente cuando está habilitado', () => {
      const handleClick = vi.fn();
      render(
        <CartButton
          variant="add"
          onClick={handleClick}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });
});
