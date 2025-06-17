import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';


export const getActivitiesDuration = new Trend('get_activities_duration');
export const successfulRequests = new Rate('successful_requests');


export const options = {
  stages: [
    { duration: '1m', target: 10 }, 
    { duration: '1m', target: 100 }, 
    { duration: '1m', target: 200 }, 
    { duration: '1m', target: 300 }, 
    { duration: '1m', target: 0 } 
  ],
  thresholds: {
    successful_requests: ['rate>0.88'], 
    get_activities_duration: ['p(95)<5700'], 
    http_req_failed: ['rate<0.12'] 
  }
};


export function handleSummary(data) {
  return {
    'src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}


export default function () {
  const url = 'https://fakerestapi.azurewebsites.net/api/v1/Activities';

  const res = http.get(url);

  getActivitiesDuration.add(res.timings.duration);
  successfulRequests.add(res.status === 200);

  check(res, {
    'Status code is 200': r => r.status === 200
  });
}
