import React, { useState } from 'react';
import { 
  Server, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Globe2, 
  Database, 
  Zap, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  RotateCw,
  Layers,
  Lock,
  Workflow
} from 'lucide-react';
import { MicroserviceMetric, SystemLog } from '../types';

interface SystemArchitectureViewProps {
  metrics: MicroserviceMetric[];
  logs: SystemLog[];
  onTriggerLoadTest: () => void;
  isLoadTesting: boolean;
  loadTestResults: {
    totalRequests: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
    errorRate: number;
    throughputRps: number;
  } | null;
}

export const SystemArchitectureView: React.FC<SystemArchitectureViewProps> = ({
  metrics,
  logs,
  onTriggerLoadTest,
  isLoadTesting,
  loadTestResults,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'blueprint' | 'telemetry' | 'security' | 'testing'>('blueprint');
  const [logFilter, setLogFilter] = useState<string>('all');

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'all') return true;
    return l.level === logFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#d9e3ea] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase tracking-wider">
            Cloud-Native Architecture & DevOps
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102d4f] mt-1">
            Microservices, Telemetry & Load Resilience
          </h1>
          <p className="text-xs text-slate-500">
            Event-driven microservices, multi-region scaling, GePG security protocols and automated testing
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {[
            { id: 'blueprint', label: 'Architecture', icon: Layers },
            { id: 'telemetry', label: 'Telemetry & Logs', icon: Activity },
            { id: 'security', label: 'Security & Auth', icon: Lock },
            { id: 'testing', label: 'Testing & HPA', icon: Workflow },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#102d4f] shadow-xs'
                    : 'text-slate-600 hover:text-[#102d4f]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: BLUEPRINT */}
      {selectedSubTab === 'blueprint' && (
        <div className="space-y-6">
          {/* Microservices Topology Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((svc) => (
              <div
                key={svc.name}
                className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#102d4f] line-clamp-1">{svc.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      {svc.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Globe2 className="w-3 h-3 text-slate-400" /> {svc.region}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Latency</span>
                      <span className="text-xs font-extrabold text-[#1e6fa8]">{svc.latencyMs}ms</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">RPS</span>
                      <span className="text-xs font-extrabold text-slate-700">{svc.throughputRps}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Pods</span>
                      <span className="text-xs font-extrabold text-emerald-700">{svc.activeReplicas}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>SLA Uptime</span>
                  <span className="font-extrabold text-slate-800">{svc.uptimePercent}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Architecture Architectural Highlights */}
          <div className="bg-gradient-to-r from-[#102d4f] to-[#1e507c] text-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Server className="w-5 h-5 text-[#e6ad3d]" /> Cloud-Native Microservices & Event-Driven Topology
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="font-bold text-[#e6ad3d] block mb-1">1. Event-Driven Broker (Pub/Sub)</span>
                <p className="text-slate-200">
                  Kafka / Google Cloud Pub/Sub handles asynchronous timetable sync, assessment deadlines, and GePG payment confirmation webhooks without blocking client requests.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="font-bold text-[#e6ad3d] block mb-1">2. Offline First & Conflict Resolution</span>
                <p className="text-slate-200">
                  IndexedDB local engine queues student timetable modifications offline. When connectivity is restored, vector-clock reconciliation syncs state with zero data loss.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="font-bold text-[#e6ad3d] block mb-1">3. Multi-Region High Availability</span>
                <p className="text-slate-200">
                  Primary deployment in `africa-south1` with local Tanzanian edge ingress node `tz-dar-edge1`. Automatic multi-region failover and horizontal pod auto-scaling (HPA).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TELEMETRY & LOGS */}
      {selectedSubTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Load Test Control Panel */}
          <div className="bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#102d4f] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1e6fa8]" /> Rigorous Load Test Simulation
              </h2>
              <p className="text-xs text-slate-500">
                Stress-test microservices sync throughput with 500 concurrent synthetic requests
              </p>
            </div>

            <button
              id="run-load-test-btn"
              onClick={onTriggerLoadTest}
              disabled={isLoadTesting}
              className="px-5 py-2.5 rounded-xl bg-[#1e6fa8] hover:bg-[#185a8a] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isLoadTesting ? 'animate-spin' : ''}`} />
              {isLoadTesting ? 'Simulating Peak Load...' : 'Run Load & Concurrency Test'}
            </button>
          </div>

          {/* Load Test Results Card */}
          {loadTestResults && (
            <div className="bg-[#edf7f2] border border-[#16845d]/30 rounded-2xl p-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-[#16845d] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Load Test Benchmark Passed (100% Reliable)
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {loadTestResults.totalRequests} Synthetic Requests Processed
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Throughput</span>
                  <span className="text-base font-black text-[#102d4f]">{loadTestResults.throughputRps} req/s</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">p50 Latency</span>
                  <span className="text-base font-black text-[#1e6fa8]">{loadTestResults.p50Ms}ms</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">p95 Latency</span>
                  <span className="text-base font-black text-slate-700">{loadTestResults.p95Ms}ms</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">p99 Latency</span>
                  <span className="text-base font-black text-amber-700">{loadTestResults.p99Ms}ms</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Error Rate</span>
                  <span className="text-base font-black text-[#16845d]">{loadTestResults.errorRate}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Live Structured Logs Stream */}
          <div className="bg-[#0f172a] rounded-2xl p-5 text-slate-100 shadow-md font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">Live Microservices Distributed Trace Logs</span>
              </div>

              {/* Log filter chips */}
              <div className="flex items-center gap-1.5 text-[11px]">
                {['all', 'info', 'audit', 'warn', 'error'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      logFilter === lvl ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredLogs.map((log) => (
                <div key={log.id} className="leading-relaxed hover:bg-slate-800/40 p-1.5 rounded transition-colors">
                  <span className="text-slate-500 mr-2">{log.timestamp}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold mr-2 uppercase ${
                    log.level === 'info' ? 'bg-sky-950 text-sky-400' :
                    log.level === 'audit' ? 'bg-emerald-950 text-emerald-400' :
                    log.level === 'warn' ? 'bg-amber-950 text-amber-400' : 'bg-red-950 text-red-400'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-purple-400 font-semibold mr-2">[{log.service}]</span>
                  <span className="text-slate-300">{log.message}</span>
                  <span className="text-slate-600 text-[10px] ml-2">({log.traceId})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SECURITY & AUTH */}
      {selectedSubTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#d9e3ea] shadow-xs">
            <h2 className="text-lg font-bold text-[#102d4f] flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> API Security Protocols & Governance
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Standards enforced across all API endpoints, edge proxies, and third-party integrations
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-[#fbfdff]">
                <h3 className="font-bold text-[#102d4f] text-sm mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#1e6fa8]" /> OAuth 2.0 / OIDC & Third-Party SSO
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Support for Google Identity Services (GSI) and Microsoft 365 Education OAuth 2.0. Tokens are signed via RS256 with asymmetric key rotation and short-lived access lifespans (15 mins) accompanied by refresh tokens.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-[#fbfdff]">
                <h3 className="font-bold text-[#102d4f] text-sm mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#16845d]" /> Government GePG & TIPS Webhook HMAC
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  All incoming payment settlement callbacks from Tanzanian national gateways (TIPS / GePG) require SHA-256 HMAC signature verification with unique nonce tracking to prevent replay attacks.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-[#fbfdff]">
                <h3 className="font-bold text-[#102d4f] text-sm mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" /> Token Bucket Rate Limiting & WAF
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Cloud Armor / Envoy ingress enforces a 100 req/sec token bucket policy per IP/authenticated user to thwart denial-of-service and brute force attempts against student grading databases.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-[#fbfdff]">
                <h3 className="font-bold text-[#102d4f] text-sm mb-1 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-purple-600" /> Mutual TLS (mTLS) Mesh
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Internal microservice-to-microservice traffic is encrypted in-transit using Istio / Linkerd mTLS with automated X.509 certificate issuance and renewal via SPIFFE/SPIRE.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TESTING & HPA */}
      {selectedSubTab === 'testing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#d9e3ea] shadow-xs">
            <h2 className="text-lg font-bold text-[#102d4f] flex items-center gap-2 mb-2">
              <Workflow className="w-5 h-5 text-[#1e6fa8]" /> CI/CD Automated Testing & Horizontal Auto-Scaling
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Continuous delivery quality gates and dynamic autoscaling configurations
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-[#102d4f] text-sm block mb-1">
                  1. Multi-Stage Pipeline Quality Gates (GitHub Actions / Cloud Build)
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Every commit executes: static TypeScript analysis (`tsc --noEmit`), ESLint linting, Jest unit tests on grading math, Pact contract tests for microservice schemas, and Playwright end-to-end tests for mobile responsive layouts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-[#102d4f] text-sm block mb-1">
                  2. Horizontal Pod Autoscaler (HPA) Policy
                </span>
                <pre className="mt-2 p-3 rounded-lg bg-slate-900 text-slate-200 overflow-x-auto text-[11px] leading-relaxed">
{`apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: campusflow-timetable-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: timetable-service
  minReplicas: 3
  maxReplicas: 30
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: External
    external:
      metric:
        name: pubsub_queue_backlog
      target:
        type: Value
        averageValue: 50m`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
