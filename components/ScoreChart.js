'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { useState, useCallback } from 'react';

export default function ScoreChart({ data }) {
  // Tooltipの状態管理
  const [activeTooltipData, setActiveTooltipData] = useState(null);

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
    // アクティブでない場合や、payloadが空の場合は状態をクリア
    if (!active || !payload || payload.length === 0) {
      if (activeTooltipData !== null) {
        setActiveTooltipData(null);
      }
      return null;
    }

    const activePayloads = payload.filter(p => p.value !== undefined && p.payload);
    if (activePayloads.length === 0) {
      if (activeTooltipData !== null) {
        setActiveTooltipData(null);
      }
      return null;
    }

    // 新しいデータとして設定（重複を防ぐ）
    const newData = activePayloads.map(payload => {
      const dataPoint = payload.payload;
      return {
        timestamp: dataPoint.timestamp,
        scoringMethod: dataPoint.scoringMethod,
        score: dataPoint.score,
        date: dataPoint.date,
        color: payload.color
      };
    });

    // 前回のデータと異なる場合のみ更新
    const currentKey = newData.map(d => `${d.timestamp}-${d.scoringMethod}`).join(',');
    const previousKey = activeTooltipData?.map(d => `${d.timestamp}-${d.scoringMethod}`).join(',') || '';

    if (currentKey !== previousKey) {
      setActiveTooltipData(newData);
    }

    return (
      <div style={{
        backgroundColor: '#2d3748',
        border: '1px solid #4a5568',
        padding: '10px',
        borderRadius: '4px',
        color: '#e2e8f0'
      }}>
        {(activeTooltipData || newData).map((dataPoint, index) => (
          <div key={`${dataPoint.timestamp}-${dataPoint.scoringMethod}-${index}`}>
            <p>{`日時: ${dataPoint.date.toLocaleString('ja-JP')}`}</p>
            <p style={{ color: dataPoint.color }}>
              {`${dataPoint.scoringMethod}: ${dataPoint.score.toFixed(3)}`}
            </p>
          </div>
        ))}
      </div>
    );
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