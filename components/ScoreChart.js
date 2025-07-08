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

  // 時系列順にソートされたすべての日付を取得
  const sortedData = [...data].sort((a, b) => a.date - b.date);
  
  // 採点方法別にデータをグループ化し、時系列順に並べる
  const methodDataGroups = {};
  sortedData.forEach(item => {
    const method = item.scoringMethod || 'レガシー';
    if (!methodDataGroups[method]) {
      methodDataGroups[method] = [];
    }
    methodDataGroups[method].push({
      ...item,
      dateString: item.date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
      timestamp: item.date.getTime()
    });
  });

  // 利用可能な採点方法を取得
  const availableMethods = Object.keys(methodDataGroups);

  // Y軸のドメイン（範囲）を計算
  const scores = data.map(d => d.score);
  const minScore = Math.floor(Math.min(...scores) - 1);
  const maxScore = Math.ceil(Math.max(...scores) + 1);

  // カスタムTooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const activePayloads = payload.filter(p => p.value !== undefined && p.payload);
      if (activePayloads.length === 0) return null;
      
      return (
        <div style={{
          backgroundColor: '#2d3748',
          border: '1px solid #4a5568',
          padding: '10px',
          borderRadius: '4px',
          color: '#e2e8f0'
        }}>
          {activePayloads.map(payload => {
            const dataPoint = payload.payload;
            return (
              <div key={`${dataPoint.timestamp}-${dataPoint.scoringMethod}`}>
                <p>{`日時: ${dataPoint.date.toLocaleString('ja-JP')}`}</p>
                <p style={{ color: payload.color }}>
                  {`${dataPoint.scoringMethod}: ${dataPoint.score.toFixed(3)}`}
                </p>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            dataKey="timestamp"
            stroke="#9ca3af"
            tickFormatter={(timestamp) => {
              return new Date(timestamp).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
            }}
          />
          <YAxis stroke="#9ca3af" domain={[minScore, maxScore]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />

          {/* 各採点方法の線を個別に描画 */}
          {availableMethods.map(method => (
            <Line
              key={method}
              type="linear"
              dataKey="score"
              data={methodDataGroups[method]}
              stroke={scoringMethodColors[method]}
              strokeWidth={2}
              name={method}
              activeDot={{ r: 6, fill: scoringMethodColors[method] }}
              dot={{ r: 4, fill: scoringMethodColors[method] }}
              connectNulls={false}
              strokeDasharray={method === 'レガシー' ? '5 5' : '0'}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}