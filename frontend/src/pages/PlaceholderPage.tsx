import Layout from '../components/Layout';

interface Props {
  title: string;
}

export default function PlaceholderPage({ title }: Props) {
  return (
    <Layout>
      <h1>{title}</h1>
      <p>Ця сторінка свага її немає</p>
    </Layout>
  );
}