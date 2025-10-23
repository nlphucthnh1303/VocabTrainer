import { Component, ChangeDetectionStrategy, inject, computed, signal, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import type { VocabularyItem, Topic } from '../../models/vocabulary.model';

// Use a global d3 instance from the script tag in index.html
declare var d3: any;

interface WordStats {
  wordItem: VocabularyItem;
  topicName: string;
  frequency: number;
  correct: number;
  recallRate: number; // 0 to 1
  mastery: number; // 0 to 100
  lastAttempt: number;
  reviewDate: number;
}

interface TopicStats {
  topic: Topic;
  avgMastery: number;
  wordsStudied: number;
  totalAttempts: number;
}

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportingComponent {
  private dataService = inject(DataService);
  private chartContainer = viewChild<ElementRef>('chartContainer');

  allWordStats = computed<WordStats[]>(() => {
    const topics = this.dataService.topics();
    const history = this.dataService.practiceHistory();
    const stats: WordStats[] = [];

    for (const topic of topics) {
      for (const word of topic.vocabularies) {
        const attempts = history.filter(h => h.wordId === word.id);
        if (attempts.length > 0) {
          const correct = attempts.filter(a => a.correct).length;
          const recallRate = correct / attempts.length;
          
          // Simple mastery: weighted average - more recent attempts are more important
          const sortedAttempts = [...attempts].sort((a, b) => a.timestamp - b.timestamp);
          let weightedScore = 0;
          let totalWeight = 0;
          sortedAttempts.forEach((attempt, index) => {
            const weight = Math.pow(index + 1, 2); // e.g., 1, 4, 9, 16...
            weightedScore += (attempt.correct ? 1 : 0) * weight;
            totalWeight += weight;
          });
          const mastery = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
          
          const lastAttempt = Math.max(...attempts.map(a => a.timestamp));
          
          // Simple Spaced Repetition: calculate next review date
          let reviewDays = 1;
          if (mastery > 90) reviewDays = 14;
          else if (mastery > 75) reviewDays = 7;
          else if (mastery > 50) reviewDays = 3;
          const reviewDate = lastAttempt + reviewDays * 24 * 60 * 60 * 1000;

          stats.push({
            wordItem: word,
            topicName: topic.name,
            frequency: attempts.length,
            correct: correct,
            recallRate: recallRate,
            mastery: mastery,
            lastAttempt: lastAttempt,
            reviewDate: reviewDate
          });
        }
      }
    }
    return stats;
  });

  allTopicStats = computed<TopicStats[]>(() => {
    const topics = this.dataService.topics();
    const wordStats = this.allWordStats();
    
    return topics.map(topic => {
      const topicWordStats = wordStats.filter(ws => ws.topicName === topic.name);
      const totalMastery = topicWordStats.reduce((sum, ws) => sum + ws.mastery, 0);
      const avgMastery = topicWordStats.length > 0 ? totalMastery / topicWordStats.length : 0;
      const totalAttempts = topicWordStats.reduce((sum, ws) => sum + ws.frequency, 0);

      return {
        topic: topic,
        avgMastery: avgMastery,
        wordsStudied: topicWordStats.length,
        totalAttempts: totalAttempts,
      };
    }).sort((a,b) => b.avgMastery - a.avgMastery);
  });
  
  wordsToReview = computed(() => {
    const now = Date.now();
    return this.allWordStats()
      .filter(ws => ws.reviewDate <= now || ws.mastery < 60)
      .sort((a, b) => a.reviewDate - b.reviewDate)
      .slice(0, 10);
  });

  overallStats = computed(() => {
    const stats = this.allWordStats();
    const totalAttempts = stats.reduce((sum, s) => sum + s.frequency, 0);
    const totalCorrect = stats.reduce((sum, s) => sum + s.correct, 0);
    const overallAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    return {
      wordsStudied: new Set(stats.map(s => s.wordItem.id)).size,
      totalAttempts,
      overallAccuracy,
    };
  });

  constructor() {
    // Redraw chart when data changes
    effect(() => {
      if (this.allTopicStats().length > 0 && this.chartContainer()) {
        this.drawChart(this.allTopicStats());
      }
    });
  }

  private drawChart(data: TopicStats[]): void {
    const container = this.chartContainer()!.nativeElement;
    d3.select(container).select('svg').remove();

    const margin = { top: 20, right: 20, bottom: 80, left: 40 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(container).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.topic.name))
      .padding(0.2);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    svg.append('g').call(d3.axisLeft(y));

    svg.selectAll('mybar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.topic.name))
      .attr('y', d => y(d.avgMastery))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.avgMastery))
      .attr('fill', '#4f46e5');
  }
}