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
  
  // 統一された時系列データを作成
  const timeSeriesData = sortedData.map((item, index) => {
    const baseData = {
      index: index,
      date: item.date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
      fullDate: item.date,
      timestamp: item.date.getTime()
    };
    
    // 各採点方法のスコアを個別のプロパティとして設定
    const method = item.scoringMethod || 'レガシー';
    baseData[method] = item.score;
    baseData[`${method}_fullData`] = item; // Tooltip用の完全なデータ
    
    return baseData;
  });

  // 利用可能な採点方法を取得
  const availableMethods = [...new Set(data.map(item => item.scoringMethod || 'レガシー'))];

  // Y軸のドメイン（範囲）を計算
  const scores = data.map(d => d.score);
  const minScore = Math.floor(Math.min(...scores) - 1);
  const maxScore = Math.ceil(Math.max(...scores) + 1);

  // カスタムTooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const activePayloads = payload.filter(p => p.value !== undefined);
      if (activePayloads.length === 0) return null;
      
      const firstPayload = activePayloads[0];
      const dataPoint = firstPayload.payload;
      
      return (
        <div style={{
          backgroundColor: '#2d3748',
          border: '1px solid #4a5568',
          padding: '10px',
          borderRadius: '4px',
          color: '#e2e8f0'
        }}>
          <p>{`日時: ${dataPoint.fullDate.toLocaleString('ja-JP')}`}</p>
          {activePayloads.map(payload => {
            const method = payload.dataKey;
            const fullData = dataPoint[`${method}_fullData`];
            if (fullData) {
              return (
                <p key={method} style={{ color: payload.color }}>
                  {`${method}: ${payload.value.toFixed(3)}`}
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  // X軸のtickFormatterで日付を表示
  const formatXAxisLabel = (tickItem, index) => {
    if (index % Math.ceil(timeSeriesData.length / 6) === 0) {
      return tickItem;
    }
    return '';
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          data={timeSeriesData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            tickFormatter={formatXAxisLabel}
            interval={0}
          />
          <YAxis stroke="#9ca3af" domain={[minScore, maxScore]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />

          {/* 各採点方法の線を描画 */}
          {availableMethods.map(method => (
            <Line
              key={method}
              type="monotone"
              dataKey={method}
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