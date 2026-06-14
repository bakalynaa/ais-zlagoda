import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getEmployees, deleteEmployee } from '../api/employees';

interface Employee {
  id_employee: string;
  empl_surname: string;
  empl_name: string;
  empl_patronymic: string | null;
  empl_role: string;
  salary: number;
  date_of_birth: string;
  date_of_start: string;
  phone_number: string;
  city: string;
  street: string;
  zip_code: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = () => {
    getEmployees()
      .then((data) => {
        const mapped = data.map((row: any[]) => ({
          id_employee: row[0],
          empl_surname: row[1],
          empl_name: row[2],
          empl_patronymic: row[3],
          empl_role: row[4],
          salary: row[5],
          date_of_birth: row[6],
          date_of_start: row[7],
          phone_number: row[8],
          city: row[9],
          street: row[10],
          zip_code: row[11],
        }));
        setEmployees(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Видалити працівника?')) {
      deleteEmployee(id).then(fetchEmployees);
    }
  };

  return (
    <Layout>
      <h1>Працівники</h1>
      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Прізвище</th>
              <th>Ім'я</th>
              <th>По батькові</th>
              <th>Роль</th>
              <th>Зарплата</th>
              <th>Телефон</th>
              <th>Місто</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id_employee}>
                <td>{e.id_employee}</td>
                <td>{e.empl_surname}</td>
                <td>{e.empl_name}</td>
                <td>{e.empl_patronymic || '—'}</td>
                <td>{e.empl_role}</td>
                <td>{e.salary} грн</td>
                <td>{e.phone_number}</td>
                <td>{e.city}</td>
                <td>
                  <button onClick={() => handleDelete(e.id_employee)}>
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && employees.length === 0 && <p>Працівників не знайдено</p>}
    </Layout>
  );
}