'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

export default function ScoreChart({ data }) {
  // 採点方法の色マッピング
  const scoringMethodColors = {
    'AI採点': '#0ea5e9',
    'AI Heart採点': '#e91e63',
    '精密採点DX-G': '#10b981',
    'レガシー': '#64748b'
  };

  // 採点方法別にデータをグループ化
  const groupedData = data.reduce((acc, item) => {
    const method = item.scoringMethod || 'レガシー';
    if (!acc[method]) {
      acc[method] = [];
    }
    acc[method].push({
      date: item.date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
      score: item.score,
      fullDate: item.date,
      scoringMethod: method
    });
    return acc;
  }, {});

  // チャート用の統合データ（X軸のため）
  const chartData = data.map(item => ({
    date: item.date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
    score: item.score,
    scoringMethod: item.scoringMethod || 'レガシー',
    fullDate: item.date
  }));

  // Y軸のドメイン（範囲）を計算
  const scores = data.map(d => d.score);
  const minScore = Math.floor(Math.min(...scores) - 1);
  const maxScore = Math.ceil(Math.max(...scores) + 1);

  // カスタムTooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#2d3748',
          border: '1px solid #4a5568',
          padding: '10px',
          borderRadius: '4px',
          color: '#e2e8f0'
        }}>
          <p>{`日時: ${data.fullDate.toLocaleString('ja-JP')}`}</p>
          <p style={{ color: scoringMethodColors[data.scoringMethod] }}>
            {`採点方法: ${data.scoringMethod}`}
          </p>
          <p>{`スコア: ${data.score.toFixed(3)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" domain={[minScore, maxScore]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />

          {/* 採点方法別にLineを描画 */}
          {Object.entries(groupedData).map(([method, methodData]) => (
            <Line
              key={method}
              type="monotone"
              dataKey="score"
              data={methodData}
              stroke={scoringMethodColors[method]}
              strokeWidth={2}
              name={method}
              activeDot={{ r: 6, fill: scoringMethodColors[method] }}
              dot={{ r: 4, fill: scoringMethodColors[method] }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}