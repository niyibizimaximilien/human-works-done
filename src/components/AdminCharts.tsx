import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";

interface AdminChartsProps {
  assignments: any[];
  profiles: Record<string, any>;
}

const COLORS = [
  "hsl(217, 89%, 51%)",   // primary blue
  "hsl(349, 75%, 51%)",   // red
  "hsl(43, 96%, 56%)",    // yellow
  "hsl(142, 71%, 40%)",   // green
  "hsl(217, 89%, 70%)",   // light blue
];

const AdminCharts = ({ assignments, profiles }: AdminChartsProps) => {
  // Weekly volume (last 8 weeks)
  const weeklyData = (() => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const key = `W${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      weeks[key] = 0;
    }
    assignments.forEach((a) => {
      const d = new Date(a.created_at);
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
      const weekIdx = 7 - Math.floor(diffDays / 7);
      if (weekIdx >= 0 && weekIdx <= 7) {
        const keys = Object.keys(weeks);
        if (keys[weekIdx]) weeks[keys[weekIdx]]++;
      }
    });
    return Object.entries(weeks).map(([name, count]) => ({ name, count }));
  })();

  // Status distribution
  const statusData = (() => {
    const counts: Record<string, number> = {};
    assignments.forEach((a) => {
      const s = a.admin_released ? "Completed" : a.status === "submitted" ? "Under Review" : a.status === "in_progress" ? "In Progress" : a.status;
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Revenue trend (last 6 months)
  const revenueData = (() => {
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-US", { month: "short" });
      months[key] = 0;
    }
    assignments.filter(a => a.status === "completed").forEach((a) => {
      const d = new Date(a.created_at);
      const key = d.toLocaleDateString("en-US", { month: "short" });
      if (key in months) months[key] += parseFloat(a.budget) || 0;
    });
    return Object.entries(months).map(([name, revenue]) => ({ name, revenue }));
  })();

  // Top agents by assignments
  const agentData = (() => {
    const counts: Record<string, number> = {};
    assignments.forEach((a) => {
      if (a.agent_id) {
        const name = profiles[a.agent_id]?.full_name || "Unknown";
        counts[name] = (counts[name] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, tasks]) => ({ name: name.split(" ")[0], tasks }));
  })();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading">Weekly Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(217, 89%, 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(142, 71%, 40%)" fill="hsl(142, 71%, 40%)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading">Top Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={60} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="tasks" fill="hsl(349, 75%, 51%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCharts;
