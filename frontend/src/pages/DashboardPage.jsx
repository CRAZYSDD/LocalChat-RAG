import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactECharts from 'echarts-for-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchDashboard } from '../store/slices/settingsSlice';
import { formatTime } from '../utils/format';

const cardStyles = {
  会话总数: {
    tag: 'Sessions',
    accent: 'from-slate-900 to-slate-500 dark:from-slate-100 dark:to-slate-500',
    bg: 'from-slate-50 to-white dark:from-slate-900 dark:to-slate-950',
    pill: 'bg-slate-900 text-white dark:bg-white dark:text-slate-950',
    text: 'text-slate-900 dark:text-white',
  },
  今日提问数: {
    tag: 'Today',
    accent: 'from-brand-600 to-emerald-400',
    bg: 'from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-950',
    pill: 'bg-brand-600 text-white dark:bg-brand-500',
    text: 'text-brand-600 dark:text-brand-300',
  },
  文档总数: {
    tag: 'Docs',
    accent: 'from-cyan-600 to-sky-400',
    bg: 'from-cyan-50 to-white dark:from-cyan-950/30 dark:to-slate-950',
    pill: 'bg-cyan-600 text-white dark:bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-300',
  },
  'RAG 调用次数': {
    tag: 'RAG',
    accent: 'from-amber-500 to-orange-400',
    bg: 'from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-950',
    pill: 'bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950',
    text: 'text-amber-600 dark:text-amber-300',
  },
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const dashboard = useSelector((state) => state.settings.dashboard);
  const theme = useSelector((state) => state.ui.theme);
  const trend = dashboard?.trend || { labels: [], questions: [], rag_calls: [] };
  const modeDistribution = dashboard?.mode_distribution || [];
  const knowledge = dashboard?.knowledge || { total_chunks: 0, status_labels: [], status_values: [] };
  const recentSessions = dashboard?.recent_sessions || [];

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const weekQuestions = trend.questions.reduce((sum, value) => sum + value, 0);
  const weekRagCalls = trend.rag_calls.reduce((sum, value) => sum + value, 0);
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const panelColor = theme === 'dark' ? '#020617' : '#ffffff';
  const textColor = theme === 'dark' ? '#e2e8f0' : '#0f172a';

  const option = useMemo(
    () => ({
      color: ['#10b981', '#f59e0b'],
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: panelColor,
        borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
        textStyle: { color: textColor },
        axisPointer: {
          type: 'line',
          lineStyle: { color: '#10b981', opacity: 0.45 },
        },
      },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: axisColor },
        itemGap: 18,
      },
      grid: {
        top: 48,
        left: 36,
        right: 24,
        bottom: 28,
      },
      xAxis: {
        type: 'category',
        data: trend.labels,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: axisColor },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
        axisLabel: { color: axisColor },
      },
      series: [
        {
          name: '提问量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          data: trend.questions,
          areaStyle: { color: 'rgba(16,185,129,0.14)' },
          lineStyle: { color: '#10b981', width: 3 },
          itemStyle: { color: '#10b981' },
        },
        {
          name: 'RAG 调用',
          type: 'bar',
          barMaxWidth: 26,
          data: trend.rag_calls,
          itemStyle: {
            color: '#f59e0b',
            borderRadius: [8, 8, 0, 0],
          },
        },
      ],
    }),
    [axisColor, gridColor, panelColor, textColor, theme, trend.labels, trend.questions, trend.rag_calls],
  );

  const modeOption = useMemo(
    () => ({
      color: ['#10b981', '#f59e0b'],
      tooltip: {
        trigger: 'item',
        backgroundColor: panelColor,
        borderColor: gridColor,
        textStyle: { color: textColor },
      },
      legend: {
        bottom: 0,
        left: 'center',
        textStyle: { color: axisColor },
      },
      series: [
        {
          name: '会话模式',
          type: 'pie',
          radius: ['55%', '76%'],
          center: ['50%', '43%'],
          avoidLabelOverlap: true,
          label: {
            color: axisColor,
            formatter: '{b}\n{c}',
          },
          itemStyle: {
            borderColor: panelColor,
            borderWidth: 3,
          },
          data: modeDistribution,
        },
      ],
    }),
    [axisColor, gridColor, modeDistribution, panelColor, textColor],
  );

  const knowledgeOption = useMemo(
    () => ({
      color: ['#06b6d4'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: panelColor,
        borderColor: gridColor,
        textStyle: { color: textColor },
      },
      grid: {
        top: 20,
        left: 28,
        right: 16,
        bottom: 28,
      },
      xAxis: {
        type: 'category',
        data: knowledge.status_labels,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: axisColor },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
        axisLabel: { color: axisColor },
      },
      series: [
        {
          name: '文档数',
          type: 'bar',
          barMaxWidth: 28,
          data: knowledge.status_values,
          itemStyle: {
            color: '#06b6d4',
            borderRadius: [8, 8, 0, 0],
          },
        },
      ],
    }),
    [axisColor, gridColor, knowledge.status_labels, knowledge.status_values, panelColor, textColor],
  );

  if (!dashboard) return <LoadingSpinner text="正在加载看板数据..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-brand-600 dark:text-brand-300">Live Metrics</p>
          <h2 className="mt-2 text-2xl font-semibold">数据看板</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">所有指标均来自当前会话、消息和知识库文件。</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          最近 7 天实时统计
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.cards.map((card) => (
          <div
            key={card.label}
            className={`group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-panel dark:border-slate-800 ${
              cardStyles[card.label]?.bg || 'from-white to-slate-50 dark:from-slate-900 dark:to-slate-950'
            }`}
          >
            <div
              className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-15 blur-2xl ${
                cardStyles[card.label]?.accent || 'from-brand-600 to-emerald-400'
              }`}
            />
            <div
              className={`absolute bottom-0 left-0 top-0 w-1.5 bg-gradient-to-b ${
                cardStyles[card.label]?.accent || 'from-brand-600 to-emerald-400'
              }`}
            />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className={`mt-3 text-4xl font-semibold tracking-tight ${cardStyles[card.label]?.text || ''}`}>
                  {card.value}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                  cardStyles[card.label]?.pill || 'bg-slate-900 text-white'
                }`}
              >
                {cardStyles[card.label]?.tag || 'Metric'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">最近 7 天趋势</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">按真实用户消息和 RAG 会话统计。</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
              7 天提问 {weekQuestions}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              7 天 RAG {weekRagCalls}
            </span>
          </div>
        </div>
        <ReactECharts option={option} style={{ height: 360 }} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">会话模式分布</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">普通对话与 RAG 问答的真实会话占比。</p>
          </div>
          <ReactECharts option={modeOption} style={{ height: 300 }} />
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">知识库状态</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">按当前文档状态统计，Chunk 总数同步后端数据。</p>
            </div>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
              Chunk {knowledge.total_chunks}
            </span>
          </div>
          <ReactECharts option={knowledgeOption} style={{ height: 300 }} />
        </div>
      </div>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">最近会话</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">按更新时间展示最近 6 条会话。</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">会话名称</th>
                <th className="px-4 py-2 font-medium">模式</th>
                <th className="px-4 py-2 font-medium">消息数</th>
                <th className="px-4 py-2 font-medium">更新时间</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session) => (
                <tr key={session.id} className="bg-slate-50 text-slate-600 dark:bg-slate-950/50 dark:text-slate-300">
                  <td className="rounded-l-2xl px-4 py-3 font-medium text-slate-900 dark:text-white">{session.title}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                      {session.mode === 'rag' ? 'RAG 问答' : '普通对话'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{session.message_count}</td>
                  <td className="rounded-r-2xl px-4 py-3">{formatTime(session.updated_at)}</td>
                </tr>
              ))}
              {!recentSessions.length ? (
                <tr>
                  <td className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-400 dark:bg-slate-950/50" colSpan="4">
                    暂无会话数据
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
