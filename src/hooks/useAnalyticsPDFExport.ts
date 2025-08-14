import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from 'jspdf';
import { addLogoToPDF, addFooter } from '@/utils/pdfExportUtils';

export const useAnalyticsPDFExport = () => {
  const { user } = useAuth();

  const drawBarChart = (pdf: jsPDF, data: any[], x: number, y: number, width: number, height: number, title: string) => {
    // Draw chart title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, x, y - 5);
    
    // Draw chart border
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(x, y, width, height);
    
    if (!data || data.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available', x + width/2 - 20, y + height/2);
      return;
    }
    
    const maxValue = Math.max(...data.map(d => Math.max(d.experiments || 0, d.reports || 0, d.tasks || 0)));
    if (maxValue === 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available', x + width/2 - 20, y + height/2);
      return;
    }
    
    const chartPadding = 20;
    const chartWidth = width - (chartPadding * 2);
    const chartHeight = height - 35;
    const chartX = x + chartPadding;
    const chartY = y + 10;
    const barGroupWidth = chartWidth / data.length;
    const barWidth = Math.max(barGroupWidth * 0.25, 4);
    const barGap = barWidth * 0.2;
    
    // Draw grid lines
    pdf.setDrawColor(240, 240, 240);
    pdf.setLineWidth(0.5);
    for (let i = 0; i <= 4; i++) {
      const gridY = chartY + (i * chartHeight / 4);
      pdf.line(chartX, gridY, chartX + chartWidth, gridY);
    }
    
    // Draw Y-axis
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.line(chartX, chartY, chartX, chartY + chartHeight);
    
    // Draw X-axis
    pdf.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight);
    
    // Draw Y-axis labels
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    for (let i = 0; i <= 4; i++) {
      const value = Math.round((maxValue / 4) * (4 - i));
      const labelY = chartY + (i * chartHeight / 4) + 2;
      pdf.text(value.toString(), chartX - 12, labelY);
    }
    
    data.forEach((item, index) => {
      const groupX = chartX + (index * barGroupWidth) + (barGroupWidth - (barWidth * 3 + barGap * 2)) / 2;
      
      // Draw experiments bar (blue)
      if (item.experiments > 0) {
        const barHeight = (item.experiments / maxValue) * chartHeight;
        pdf.setFillColor(59, 130, 246);
        pdf.rect(groupX, chartY + chartHeight - barHeight, barWidth, barHeight, 'F');
      }
      
      // Draw reports bar (green)
      if (item.reports > 0) {
        const barHeight = (item.reports / maxValue) * chartHeight;
        pdf.setFillColor(16, 185, 129);
        pdf.rect(groupX + barWidth + barGap, chartY + chartHeight - barHeight, barWidth, barHeight, 'F');
      }
      
      // Draw tasks bar (yellow)
      if (item.tasks > 0) {
        const barHeight = (item.tasks / maxValue) * chartHeight;
        pdf.setFillColor(245, 158, 11);
        pdf.rect(groupX + (barWidth + barGap) * 2, chartY + chartHeight - barHeight, barWidth, barHeight, 'F');
      }
      
      // Draw month label
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      const labelX = chartX + (index * barGroupWidth) + (barGroupWidth / 2) - 5;
      pdf.text(item.month, labelX, chartY + chartHeight + 12);
    });
    
    // Draw legend - positioned to avoid overlap
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    const legendX = x + width - 80;
    const legendY = y + 15;
    
    pdf.setFillColor(59, 130, 246);
    pdf.rect(legendX, legendY, 6, 4, 'F');
    pdf.text('Experiments', legendX + 10, legendY + 3);
    
    pdf.setFillColor(16, 185, 129);
    pdf.rect(legendX, legendY + 8, 6, 4, 'F');
    pdf.text('Reports', legendX + 10, legendY + 11);
    
    pdf.setFillColor(245, 158, 11);
    pdf.rect(legendX, legendY + 16, 6, 4, 'F');
    pdf.text('Tasks', legendX + 10, legendY + 19);
  };

  const drawPieChart = (pdf: jsPDF, data: any[], x: number, y: number, radius: number, title: string) => {
    // Draw chart title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(title, x - radius, y - radius - 15);
    
    if (!data || data.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available', x - 20, y);
      return;
    }
    
    const colors = [
      [0, 136, 254],   // blue
      [0, 196, 159],   // green  
      [255, 187, 40],  // yellow
      [255, 128, 66]   // orange
    ];
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available', x - 20, y);
      return;
    }
    
    let currentAngle = -Math.PI / 2;
    
    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      const color = colors[index % colors.length];
      pdf.setFillColor(color[0], color[1], color[2]);
      
      // Draw pie slice using triangular segments
      const steps = Math.max(12, Math.floor(sliceAngle * 25));
      const stepAngle = sliceAngle / steps;
      
      for (let i = 0; i < steps; i++) {
        const angle1 = currentAngle + (i * stepAngle);
        const angle2 = currentAngle + ((i + 1) * stepAngle);
        
        const x1 = x + Math.cos(angle1) * radius;
        const y1 = y + Math.sin(angle1) * radius;
        const x2 = x + Math.cos(angle2) * radius;
        const y2 = y + Math.sin(angle2) * radius;
        
        pdf.triangle(x, y, x1, y1, x2, y2, 'F');
      }
      
      currentAngle += sliceAngle;
    });
    
    // Draw legend below pie chart to avoid overlap
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    data.forEach((item, index) => {
      const legendY = y + radius + 25 + (index * 8);
      const color = colors[index % colors.length];
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.rect(x - radius, legendY - 3, 6, 4, 'F');
      
      const percentage = ((item.value / total) * 100).toFixed(1);
      pdf.text(`${item.name}: ${item.value} (${percentage}%)`, x - radius + 10, legendY);
    });
  };

  const drawLineChart = (pdf: jsPDF, data: any[], x: number, y: number, width: number, height: number, title: string) => {
    // Draw chart title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(title, x, y - 5);
    
    // Draw chart border
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(x, y, width, height);
    
    if (!data || data.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available', x + width/2 - 20, y + height/2);
      return;
    }
    
    const maxValue = Math.max(...data.map(d => d.productivity || 0));
    const minValue = Math.min(...data.map(d => d.productivity || 0));
    const valueRange = maxValue - minValue || 1;
    
    const chartPadding = 20;
    const chartWidth = width - (chartPadding * 2);
    const chartHeight = height - 35;
    const chartX = x + chartPadding;
    const chartY = y + 10;
    const stepWidth = chartWidth / Math.max(data.length - 1, 1);
    
    // Draw grid lines
    pdf.setDrawColor(240, 240, 240);
    pdf.setLineWidth(0.5);
    for (let i = 0; i <= 4; i++) {
      const gridY = chartY + (i * chartHeight / 4);
      pdf.line(chartX, gridY, chartX + chartWidth, gridY);
    }
    
    // Draw axes
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.line(chartX, chartY, chartX, chartY + chartHeight);
    pdf.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight);
    
    // Draw Y-axis labels
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    for (let i = 0; i <= 4; i++) {
      const value = minValue + (valueRange / 4) * (4 - i);
      const labelY = chartY + (i * chartHeight / 4) + 2;
      pdf.text(Math.round(value).toString(), chartX - 15, labelY);
    }
    
    // Draw line and points
    pdf.setDrawColor(139, 92, 246);
    pdf.setLineWidth(2);
    
    const points = data.map((item, index) => ({
      x: chartX + (index * stepWidth),
      y: chartY + chartHeight - ((item.productivity - minValue) / valueRange) * chartHeight
    }));
    
    // Draw line segments
    for (let i = 0; i < points.length - 1; i++) {
      pdf.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }
    
    // Draw data points
    pdf.setFillColor(139, 92, 246);
    points.forEach(point => {
      pdf.circle(point.x, point.y, 1.5, 'F');
    });
    
    // Draw x-axis labels
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    data.forEach((item, index) => {
      const labelX = chartX + (index * stepWidth) - 5;
      pdf.text(item.week, labelX, chartY + chartHeight + 12);
    });
  };

  const exportAnalyticsToPDF = useMutation({
    mutationFn: async ({ 
      data,
      reportTitle = "KAPELCZAK LABORATORY - ANALYTICS REPORT"
    }: {
      data: any;
      reportTitle?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = 20;

      // Add logo
      const logoHeight = await addLogoToPDF(pdf, pageWidth, margin);
      yPosition = margin + logoHeight;

      // Add header
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(reportTitle, margin, yPosition);
      yPosition += 12;

      // Add generation info
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const exportTime = new Date().toLocaleString();
      pdf.text(`Generated on: ${exportTime}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Generated by: ${user.email}`, margin, yPosition);
      yPosition += 20;

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
          return true;
        }
        return false;
      };

      // Add Key Metrics section
      checkPageBreak(60);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Performance Metrics', margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const metrics = [
        { label: 'Total Experiments', value: data.totalExperiments },
        { label: 'Completed Experiments', value: data.completedExperiments },
        { label: 'Tasks Completed', value: data.completedTasks },
        { label: 'Total Tasks', value: data.totalTasks },
        { label: 'Active Projects', value: data.totalProjects },
        { label: 'Average Completion Time', value: `${data.avgCompletionTime} days` },
      ];

      metrics.forEach(metric => {
        checkPageBreak(8);
        pdf.text(`${metric.label}: ${metric.value}`, margin, yPosition);
        yPosition += 8;
      });

      yPosition += 15;

      // Add Charts section
      checkPageBreak(100);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Charts & Visualizations', margin, yPosition);
      yPosition += 15;

      // Monthly Activity Chart - give it proper spacing
      if (data.monthlyData && data.monthlyData.length > 0) {
        checkPageBreak(90);
        drawBarChart(pdf, data.monthlyData, margin, yPosition, contentWidth, 70, 'Monthly Activity');
        yPosition += 90;
      }

      // Experiment Status Distribution Chart - ensure no overlap
      if (data.experimentStatusData && data.experimentStatusData.length > 0) {
        checkPageBreak(120);
        const pieChartX = pageWidth / 2;
        const pieChartY = yPosition + 40;
        drawPieChart(pdf, data.experimentStatusData, pieChartX, pieChartY, 25, 'Experiment Status Distribution');
        yPosition += 120;
      }

      // Weekly Productivity Trend Chart
      if (data.productivityData && data.productivityData.length > 0) {
        checkPageBreak(90);
        drawLineChart(pdf, data.productivityData, margin, yPosition, contentWidth, 70, 'Weekly Productivity Trend');
        yPosition += 90;
      }

      // Experiment status distribution
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Experiment Status Distribution', margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      if (data.experimentStatusData && data.experimentStatusData.length > 0) {
        data.experimentStatusData.forEach((status: any) => {
          checkPageBreak(8);
          const percentage = data.totalExperiments > 0 
            ? ((status.value / data.totalExperiments) * 100).toFixed(1)
            : '0';
          pdf.text(`${status.name}: ${status.value} (${percentage}%)`, margin, yPosition);
          yPosition += 8;
        });
      } else {
        pdf.text('No experiment data available', margin, yPosition);
        yPosition += 8;
      }

      yPosition += 15;

      // Add Monthly Activity Summary
      checkPageBreak(40);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Monthly Activity Summary', margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      if (data.monthlyData && data.monthlyData.length > 0) {
        data.monthlyData.forEach((month: any) => {
          checkPageBreak(8);
          pdf.text(`${month.month}: ${month.experiments} experiments, ${month.reports} reports, ${month.tasks} tasks`, margin, yPosition);
          yPosition += 8;
        });
      }

      yPosition += 15;

      // Add Key Insights
      checkPageBreak(60);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Insights', margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      const insights = [
        `Experiment completion rate: ${data.totalExperiments > 0 ? Math.round((data.completedExperiments / data.totalExperiments) * 100) : 0}%`,
        `Task completion rate: ${data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0}%`,
        `Active team members: ${data.activeTeamMembers} working on ${data.totalProjects} projects`,
        `Average experiment completion time: ${data.avgCompletionTime} days`,
      ];

      insights.forEach(insight => {
        checkPageBreak(10);
        const lines = pdf.splitTextToSize(`• ${insight}`, contentWidth - 10);
        lines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += 6;
        });
        yPosition += 4;
      });

      // Add footer to all pages
      addFooter(pdf, pageWidth, pageHeight, margin);

      // Save the PDF
      const fileName = `Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      return { success: true };
    },
  });

  return {
    exportAnalyticsToPDF,
  };
};
