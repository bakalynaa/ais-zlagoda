import { Link, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';



interface Props {

  children: React.ReactNode;

}



export default function Layout({ children }: Props) {

  const navigate = useNavigate();

  const role = localStorage.getItem('role');



  function handleLogout() {

    localStorage.removeItem('token');

    localStorage.removeItem('role');

    navigate('/first-screen');

  }



  return (

    <div className="layout">

      <header className="layout-header">

        <span className="logo">SVAGoda</span>

        <span className="role">{role === 'Manager' ? 'Менеджер свагу' : 'Касир'}</span>

        <div className="layout-actions">

          <Link to="/profile" className="profile-link">Профіль</Link>

          <button type="button" onClick={handleLogout}>

            Вийти

          </button>

        </div>

      </header>

      <div className="layout-body">

        <Sidebar />

        <main className="layout-content">{children}</main>

      </div>

    </div>

  );

}


