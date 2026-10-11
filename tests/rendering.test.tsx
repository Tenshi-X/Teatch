import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { QuestionContent } from '@/components/worksheets/question-content';
import { QuestionInput } from '@/components/quiz/interactions';
import { fixtures, correctInput } from './fixtures';
for (const q of fixtures)
  test(`preview, interactive controls and printable content: ${q.type}`, () => {
    for (const showAnswer of [false, true]) {
      const markup = renderToStaticMarkup(
        <QuestionContent question={q} showAnswer={showAnswer} print />
      );
      assert.ok(markup.length > 100);
      assert.ok(!markup.includes('<img'));
      assert.ok(!markup.includes('https://'));
    }
    const interactive = renderToStaticMarkup(
      <QuestionInput question={q} value={correctInput(q)} onChange={() => {}} />
    );
    assert.ok(
      interactive.includes('<button') ||
        interactive.includes('<input') ||
        interactive.includes('<textarea') ||
        interactive.includes('<select')
    );
    if (q.type === 'count_image') {
      const html = renderToStaticMarkup(<QuestionContent question={q} />);
      assert.equal((html.match(/<svg/g) || []).length, q.count);
    }
    if (q.type === 'story_qa')
      assert.ok(
        renderToStaticMarkup(<QuestionContent question={q} />).includes(q.story)
      );
  });
