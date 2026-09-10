function  cubicBezierPoint(p0, p1, p2, p3, t) {
    const mt = 1 - t;

    return {
        x: (mt * mt* mt * p0.x) + (3 * mt * mt * t * p1.x) + (3 * mt * t * t * p2.x) + (t * t * t * t * p3.x),
        y: (mt * mt * mt * p0.y) + (3 * mt * mt * t * p1.y) + (3 * mt * t * t * p2.y) + (t * t * t * t * p3.y)
    };

    }

    function sampleSegment(p0, p1, p2, p3, count) {
        const pts = [];

        for (let i = 0; i <= count; i++) {
            pts.push(cubicBezierPoint(p0, p1, p2, p3, i / count));
        }
        return pts;
        }

        const POINTS_PER_SEGMENT = 24;

        const segA = sampleSegment({ x: 30, y: 150 }, { x: 70, y: 50 }, { x: 180, y: 50 }, { x: 220, y: 150 }, POINTS_PER_SEGMENT);
        const SegB = sampleSegment({ x: 220, y: 150 }, { x: 260, y: 250 }, { x: 350, y: 270 }, { x: 390, y: 180 }, POINTS_PER_SEGMENT);
        const segC = sampleSegment({ x: 390, y: 180 }, { x: 410, y: 120 }, { x: 370, y: 30 }, { x: 280, y: 40 }, POINTS_PER_SEGMENT);

        const haulRoadPath = [
            ...segA,
            ...SegB.slice(1),
            ...segC.slice(1)
        ];

        const fogZones = [
            { id: 'zoneA' , cx: 120, cy: 130, r: 60 },
            { id: 'zoneB', cx: 290, cy: 190, r: 70 },
            { id: 'zoneC', cx: 350, cy: 60, r: 50 }
        ];

        module.exports = { haulRoadPath, fogZones };