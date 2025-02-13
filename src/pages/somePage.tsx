import { GetServerSideProps } from 'next';

interface Data {
  // ここにdataの型を定義します。例:
  id: number;
  name: string;
  // 他のプロパティを追加
}

const SomePage = ({ data }: { data: Data }) => {
  return (
    <div>
      <h1>Data from Server</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const res = await fetch('https://api.example.com/data');
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    const data: Data = await res.json();

    return {
      props: {
        data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        data: null, // エラー時のデフォルト値
      },
    };
  }
};

export default SomePage;
