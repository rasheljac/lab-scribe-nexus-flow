
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
    const barWidth = (width - 20) / data.length;
    const chartHeight = height - 30;
    
    data.forEach((item, index) => {
      const barX = x + 10 + (index * barWidth);
      
      // Draw experiments bar (blue)
      if (item.experiments) {
        const barHeight = (item.experiments / maxValue) * chartHeight;
        pdf.setFillColor(59, 130, 246);
        pdf.rect(barX, y + height - 20 - barHeight, barWidth * 0.25, barHeight, 'F');
      }
      
      // Draw reports bar (green)
      if (item.reports) {
        const barHeight = (item.reports / maxValue) * chartHeight;
        pdf.setFillColor(16, 185, 129);
        pdf.rect(barX + barWidth * 0.3, y + height - 20 - barHeight, barWidth * 0.25, barHeight, 'F');
      }
      
      // Draw tasks bar (yellow)
      if (item.tasks) {
        const barHeight = (item.tasks / maxValue) * chartHeight;
        pdf.setFillColor(245, 158, 11);
        pdf.rect(barX + barWidth * 0.6, y + height - 20 - barHeight, barWidth * 0.25, barHeight, 'F');
      }
      
      // Draw month label
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.month, barX + barWidth/2 - 5, y + height - 5);
    });
    
    // Draw legend
    pdf.setFontSize(8);
    pdf.setFillColor(59, 130, 246);
    pdf.rect(x + width - 80, y + 5, 8, 4, 'F');
    pdf.text('Experiments', x + width - 65, y + 8);
    
    pdf.setFillColor(16, 185, 129);
    pdf.rect(x + width - 80, y + 12, 8, 4, 'F');
    pdf.text('Reports', x + width - 65, y + 15);
    
    pdf.setFillColor(245, 158, 11);
    pdf.rect(x + width - 80, y + 19, 8, 4, 'F');
    pdf.text('Tasks', x + width - 65, y + 22);
  };

  const drawPieChart = (pdf: jsPDF, data: any[], x: number, y: number, radius: number, title: string) => {
    // Draw chart title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, x - 30, y - radius - 10);
    
    if (!data || data.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available', x - 20, y);
      return;
    }
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      // Set color based on item color or default colors
      const colors = [
        [34, 197, 94],   // green
        [59, 130, 246],  // blue
        [245, 158, 11],  // yellow
        [239, 68, 68]    // red
      ];
      const color = colors[index % colors.length];
      pdf.setFillColor(color[0], color[1], color[2]);
      
      // Draw pie slice (approximated with lines)
      const steps = Math.max(3, Math.floor(sliceAngle * 10));
      const stepAngle = sliceAngle / steps;
      
      for (let i = 0; i < steps; i++) {
        const angle1 = currentAngle + (i * stepAngle);
        const angle2 = currentAngle + ((i + 1) * stepAngle);
        
        const x1 = x + Math.cos(angle1) * radius;
        const y1 = y + Math.sin(angle1) * radius;
        const x2 = x + Math.cos(angle2) * radius;
        const y2 = y + Math.sin(angle2) * radius;
        
        // Draw triangle slice
        pdf.setDrawColor(255, 255, 255);
        pdf.triangle(x, y, x1, y1, x2, y2, 'FD');
      }
      
      currentAngle += sliceAngle;
    });
    
    // Draw legend
    data.forEach((item, index) => {
      const legendY = y + radius + 15 + (index * 8);
      const color = colors[index % colors.length];
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.rect(x - 40, legendY - 3, 6, 4, 'F');
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${item.name}: ${item.value}`, x - 30, legendY);
    });
  };

  const drawLineChart = (pdf: jsPDF, data: any[], x: number, y: number, width: number, height: number, title: string) => {
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
    
    const maxValue = Math.max(...data.map(d => d.productivity || 0));
    const minValue = Math.min(...data.map(d => d.productivity || 0));
    const chartWidth = width - 20;
    const chartHeight = height - 30;
    const stepWidth = chartWidth / (data.length - 1);
    
    // Draw grid lines
    pdf.setDrawColor(240, 240, 240);
    for (let i = 0; i <= 4; i++) {
      const gridY = y + 10 + (i * chartHeight / 4);
      pdf.line(x + 10, gridY, x + width - 10, gridY);
    }
    
    // Draw line
    pdf.setDrawColor(139, 92, 246);
    pdf.setLineWidth(2);
    
    let prevX = x + 10;
    let prevY = y + height - 20 - ((data[0].productivity - minValue) / (maxValue - minValue)) * chartHeight;
    
    data.forEach((item, index) => {
      if (index === 0) return;
      
      const currentX = x + 10 + (index * stepWidth);
      const currentY = y + height - 20 - ((item.productivity - minValue) / (maxValue - minValue)) * chartHeight;
      
      pdf.line(prevX, prevY, currentX, currentY);
      
      // Draw data points
      pdf.setFillColor(139, 92, 246);
      pdf.circle(currentX, currentY, 1.5, 'F');
      
      prevX = currentX;
      prevY = currentY;
    });
    
    // Draw first data point
    pdf.circle(x + 10, y + height - 20 - ((data[0].productivity - minValue) / (maxValue - minValue)) * chartHeight, 1.5, 'F');
    
    // Draw x-axis labels
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    data.forEach((item, index) => {
      const labelX = x + 10 + (index * stepWidth);
      pdf.text(item.week, labelX - 8, y + height - 5);
    });
    
    pdf.setLineWidth(0.5);
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

      // Add Monthly Activity Chart
      checkPageBreak(80);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Charts & Visualizations', margin, yPosition);
      yPosition += 15;

      if (data.monthlyData && data.monthlyData.length > 0) {
        drawBarChart(pdf, data.monthlyData, margin, yPosition, contentWidth, 60, 'Monthly Activity');
        yPosition += 80;
      }

      // Add Experiment Status Distribution Chart
      checkPageBreak(80);
      if (data.experimentStatusData && data.experimentStatusData.length > 0) {
        drawPieChart(pdf, data.experimentStatusData, margin + 60, yPosition + 40, 30, 'Experiment Status Distribution');
        yPosition += 100;
      }

      // Add Productivity Trend Chart
      checkPageBreak(80);
      if (data.productivityData && data.productivityData.length > 0) {
        drawLineChart(pdf, data.productivityData, margin, yPosition, contentWidth, 60, 'Weekly Productivity Trend');
        yPosition += 80;
      }

      // Add Experiment Status Distribution (text summary)
      checkPageBreak(40);
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
