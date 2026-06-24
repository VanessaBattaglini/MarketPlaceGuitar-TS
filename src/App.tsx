import Guitar from "./components/Guitar";
import Header from "./components/Header";
import { useCartWithPersistence } from "./hooks/useCartWithPersistence";

/**
 * Componente principal de la aplicación
 * Gestiona el carrito de compras y renderiza la interfaz
 */
function App() {
  // Hook personalizado que maneja estado + persistencia con manejo de errores
  const [state, dispatch, persistenceStatus, persistenceError] = useCartWithPersistence();

  // Mostrar error de persistencia si ocurre
  if (persistenceStatus === 'error') {
    console.error('Error de persistencia:', persistenceError);
  }

  return (
    <>
      <Header
        cart={state.cart}
        dispatch={dispatch}
      />

      <main className="container-xl mt-5">
        <h2 className="text-center">Nuestra Colección</h2>

        <div className="row mt-5">
          {state.data.map((guitar) => (
            <Guitar key={guitar.id} guitar={guitar} dispatch={dispatch} />
          ))}
        </div>
      </main>

      <footer className="bg-dark mt-5 py-5">
        <div className="container-xl">
          <p className="text-white text-center fs-4 mt-4 m-md-0">
            GuitarLA - Todos los derechos Reservados
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
