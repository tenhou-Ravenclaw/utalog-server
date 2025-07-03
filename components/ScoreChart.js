'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ScoreChart({ data }) {
  const chartData = data.map(item => ({
    date: item.date,
    score: item.score
  }));
  
  // Y軸のドメイン（範囲）を計算
  const scores = data.map(d => d.score);
  const minScore = Math.floor(Math.min(...scores) - 1);
  const maxScore = Math.ceil(Math.max(...scores) + 1);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" domain={[minScore, maxScore]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />
          <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={2} name="得点" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}