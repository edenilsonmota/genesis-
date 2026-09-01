import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type Health = {
  status: string;
  service: string;
  timestamp: string;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
});

export function App() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await api.get<Health>('/health')).data,
    retry: 1,
  });

  return (
    <main className="page">
      <section className="card">
        <span className="eyebrow"> React · NestJS</span>
        <h1>Genesis<span>+</span></h1>
        <div className={`status ${health.isSuccess ? 'online' : ''}`}>
          <i />
          {health.isPending && 'Verificando a API…'}
          {health.isSuccess && 'API conectada'}
          {health.isError && 'API indisponível — execute pnpm dev'}
        </div>
      </section>
    </main>
  );
}
