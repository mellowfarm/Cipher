import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import './App.css';

Chart.register(...registerables);

function ResultsScreen() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  // ── hardcoded mock data (will come from backend later) ──
  const archetype = "The Comfort Seeker";
  const portrait = "You spend to feel better. Your transactions reveal a pattern of emotional regulation — food and entertainment spike when stress is high, especially late at night. Your wallet is doing emotional work your mind hasn't processed yet.";
  const metrics = [
    { value: "73", label: "present bias", color: "#D4537E" },
    { value: "$1,847", label: "total analysed", color: "#2E7D32" },
    { value: "31%", label: "late night spend", color: "#D4537E" },
  ];
  const insights = [
    { color: "#D4537E", label: "Late night spending", text: "31% of your transactions happen after 10pm, averaging 40% above your normal transaction size." },
    { color: "#2E7D32", label: "Social spend clusters", text: "Your food spending peaks on Fridays and weekends, suggesting you spend more with others around." },
    { color: "#ED93B1", label: "Subscription creep", text: "You have 6 active subscriptions totalling $87/month. 2 show no adjacent usage signals." },
  ];
  const chartData = {
    labels: ['Food', 'Shopping', 'Transport', 'Entertainment', 'Others'],
    values: [701, 406, 332, 258, 150],
    colors: ['#D4537E', '#81C784', '#2E7D32', '#ED93B1', '#C8E6C9'],
  };

  // ── build the chart after the component renders (renders = React turning code into what you see on screen) ──
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy(); // destroy old chart if exists
    }
    const ctx = canvasRef.current;
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.values,
          backgroundColor: chartData.colors,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#999', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              color: '#999',
              font: { size: 11 },
              callback: (v) => '$' + v
            }
          }
        }
      }
    });

    // cleanup — destroy chart when component unmounts -> switch to another page
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="app">
      <div className="card">

        {/* back button */}
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

        {/* archetype card */}
        <div className="archetype-card">
          <p className="archetype-tag">YOUR SPENDING ARCHETYPE</p>
          <p className="archetype-name">{archetype}</p>
          <p className="archetype-desc">{portrait}</p>
        </div>

        {/* metric cards */}
        <div className="metrics-row">
          {metrics.map((metric, index) => (
            <div key={index} className="metric-card">
              <p className="metric-value" style={{ color: metric.color }}>
                {metric.value}
              </p>
              <p className="metric-label">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* bar chart */}
        <div className="chart-card">
          <p className="section-title">Spending by category</p>
          <div className="legend-row">
            {chartData.labels.map((label, index) => (
              <span key={index} className="legend-item">
                <span
                  className="legend-dot"
                  style={{ background: chartData.colors[index] }}
                />
                {label}
              </span>
            ))}
          </div>
          <div style={{ position: 'relative', height: '180px' }}>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Spending by category bar chart"
            />
          </div>
        </div>

        {/* behavioural insights */}
        <div className="insights-section">
          <p className="section-title">Behavioural insights</p>
          {insights.map((insight, index) => (
            <div key={index} className="insight-item">
              <div
                className="insight-dot"
                style={{ background: insight.color }}
              />
              <p className="insight-text">
                <span className="insight-label">{insight.label}</span>
                {' — '}{insight.text}
              </p>
            </div>
          ))}
        </div>

        {/* share button */}
        <button className="btn-pink" style={{ width: '100%', marginTop: '8px' }}>
          Share my archetype card →
        </button>

      </div>
    </div>
  );
}

export default ResultsScreen;