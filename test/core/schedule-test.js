/* eslint-env mocha */
var later = require('../../index')

var schedule = later.schedule

var should = require('should')

describe('Schedule', function () {
  later.date.UTC()

  describe('isValid', function () {
    var d = new Date('2013-03-21T00:00:05Z')

    it('should return true if date is valid', function () {
      var s = { schedules: [{ Y: [2013], M: [3], D: [21], s: [5] }] }
      schedule(s).isValid(d).should.eql(true)
    })

    it('should return false if date is invalid', function () {
      var s = { schedules: [{ Y: [2012] }] }
      schedule(s).isValid(d).should.eql(false)
    })
  })

  describe('next', function () {
    var d = new Date('2013-03-21T00:00:05Z')

    var e = new Date('2016-01-01T00:00:05Z')

    it('should return the start date if it is valid', function () {
      var s = { schedules: [{ Y: [2013], M: [3], D: [21], s: [5] }] }
      schedule(s).next(1, d).should.eql(d)
    })

    it('should return next valid date if one exists', function () {
      var s = { schedules: [{ Y: [2015] }] }
      schedule(s).next(1, d).should.eql(new Date('2015-01-01T00:00:00Z'))
    })

    it('should return next valid date if one exists with composite', function () {
      var s = { schedules: [{ Y: [2017] }, { Y: [2015] }] }
      schedule(s).next(1, d).should.eql(new Date('2015-01-01T00:00:00Z'))
    })

    it('should return next valid date if one exists with exceptions', function () {
      var s = { schedules: [{ Y: [2015, 2016, 2017] }], exceptions: [{ Y: [2015] }] }
      schedule(s).next(1, d).should.eql(new Date('2016-01-01T00:00:00Z'))
    })

    it('should return count valid dates if they exist', function () {
      var s = { schedules: [{ Y: [2015, 2016, 2017] }] }
      schedule(s).next(3, d).should.eql([
        new Date('2015-01-01T00:00:00Z'),
        new Date('2016-01-01T00:00:00Z'),
        new Date('2017-01-01T00:00:00Z')
      ])
    })

    it('should return later.NEVER if no next valid date exists', function () {
      var s = { schedules: [{ Y: [2012] }] }
      should.equal(schedule(s).next(1, d), later.NEVER)
    })

    it('should return later.NEVER if end date precludes a valid schedule', function () {
      var s = { schedules: [{ Y: [2017] }] }
      should.equal(schedule(s).next(1, d, e), later.NEVER)
    })
  })

  describe('prev', function () {
    var d = new Date('2013-03-21T00:00:05Z')

    var e = new Date('2010-01-01T00:00:05Z')

    it('should return the start date if it is valid', function () {
      var s = { schedules: [{ Y: [2013], M: [3], D: [21], s: [5] }] }
      schedule(s).prev(1, d).should.eql(d)
    })

    it('should return prev valid date if one exists', function () {
      var s = { schedules: [{ Y: [2012] }] }
      schedule(s).prev(1, d).should.eql(new Date('2012-01-01T00:00:00Z'))
    })

    it('should return prev valid date if one exists with exceptions', function () {
      var s = { schedules: [{ Y: [2012, 2013, 2014] }], exceptions: [{ Y: [2013] }] }
      schedule(s).prev(1, d).should.eql(new Date('2012-01-01T00:00:00Z'))
    })

    it('should return count valid dates if they exist', function () {
      var s = { schedules: [{ Y: [2010, 2011, 2012] }] }
      schedule(s).prev(3, d).should.eql([
        new Date('2012-01-01T00:00:00Z'),
        new Date('2011-01-01T00:00:00Z'),
        new Date('2010-01-01T00:00:00Z')
      ])
    })

    it('should return later.NEVER if no prev valid date exists', function () {
      var s = { schedules: [{ Y: [2017] }] }
      should.equal(schedule(s).prev(1, d), later.NEVER)
    })

    it('should return later.NEVER if end date precludes a valid schedule', function () {
      var s = { schedules: [{ Y: [2009] }] }
      should.equal(schedule(s).prev(1, d, e), later.NEVER)
    })
  })

  describe('nextRange', function () {
    it('should return next valid range if one exists', function () {
      var d = new Date('2013-03-21T00:00:05Z')

      var s = { schedules: [{ Y: [2015, 2016, 2017] }] }
      schedule(s).nextRange(1, d).should.eql([
        new Date('2015-01-01T00:00:00Z'),
        new Date('2018-01-01T00:00:00Z')
      ])
    })

    it('should correctly calculate ranges', function () {
      var d = new Date('2013-03-21T00:00:05Z')

      var s = {
        schedules: [ { dw: [ 2, 3, 4, 5, 6 ], h_a: [ 8 ], h_b: [ 16 ] } ],
        exceptions:
             [ { fd_a: [ 1362420000000 ], fd_b: [ 1362434400000 ] },
               { fd_a: [ 1363852800000 ], fd_b: [ 1363860000000 ] },
               { fd_a: [ 1364499200000 ], fd_b: [ 1364516000000 ] } ]
      }

      schedule(s).nextRange(1, d).should.eql([
        new Date('2013-03-21T10:00:00Z'),
        new Date('2013-03-21T16:00:00Z')
      ])
    })

    it('should return undefined as end if there is no end date', function () {
      var d = new Date('2013-03-21T00:00:05Z')

      var s = {
        schedules: [ { fd_a: [ 1363824005000 ] } ]
      }

      schedule(s).nextRange(3, d).should.eql([
        [new Date('2013-03-21T00:00:05Z'), undefined]
      ])
    })
  })

  describe('prevRange', function () {
    var d = new Date('2013-03-21T00:00:05Z')

    it('should return next valid range if one exists', function () {
      var s = { schedules: [{ Y: [2011, 2012] }] }
      schedule(s).prevRange(1, d).should.eql([
        new Date('2011-01-01T00:00:00Z'),
        new Date('2013-01-01T00:00:00Z')
      ])
    })

    it('should return undefined as end if there is no end date', function () {
      var d = new Date('2013-03-21T00:00:05Z')

      var s = {
        schedules: [ { fd_b: [ 1363824005000 ] } ]
      }

      schedule(s).prevRange(3, d).should.eql([
        [undefined, new Date('2013-03-21T00:00:05Z')]
      ])
    })
  })

  describe('all', function () {
    it('should return the start date as the first entry in results if it is valid', function () {
      const startDate = new Date('2013-03-21T00:00:05Z')
      const s = { schedules: [{ Y: [2013], M: [3], D: [21], s: [5] }] }
      schedule(s).all(startDate)[0].should.eql(startDate)
    })

    it('should return all valid dates if one exists', function () {
      const startDate = new Date('2013-03-21T00:00:05Z')
      const endDate = new Date('2020-01-01T00:00:05Z')
      const s = { schedules: [{ Y: [2015, 2016, 2018] }] }

      schedule(s).all(startDate, endDate).should.eql([
        new Date('2015-01-01T00:00:00Z'),
        new Date('2016-01-01T00:00:00Z'),
        new Date('2018-01-01T00:00:00Z')
      ])
    })

    // TODO: bug - doesn't work
    it.skip('should return all valid dates with year only composite', function () {
      const startDate = new Date('2013-03-21T00:00:05Z')
      const endDate = new Date('2020-01-01T00:00:05Z')
      var s = { schedules: [{ Y: [2017] }, { Y: [2015] }, { Y: [2018] }] }

      schedule(s).all(startDate, endDate).should.eql([
        new Date('2015-01-01T00:00:00Z'),
        new Date('2017-01-01T00:00:00Z'),
        new Date('2018-01-01T00:00:00Z')
      ])
    })

    it('should return all valid dates with composite', function () {
      const startDate = new Date('2013-03-21T00:00:05Z')
      var s = { schedules: [{ Y: [2017] }, { Y: [2015] }] }

      schedule(s).all(startDate).should.eql([
        new Date('2015-01-01T00:00:00Z'),
        new Date('2017-01-01T00:00:00Z')
      ])
    })

    it('should return every Tue,Thu at 4:30 in October 2018', function () {
      const startDate = new Date('2018-10-01T00:00:00Z')
      const endDate = new Date('2018-11-01T00:00:00Z')
      const s = {
        schedules: [
          { dw: [3, 5], h: [4], m: [30] }
        ]
      }
      schedule(s).all(startDate, endDate).should.eql([
        new Date('2018-10-02T04:30:00.000Z'),
        new Date('2018-10-04T04:30:00.000Z'),
        new Date('2018-10-09T04:30:00.000Z'),
        new Date('2018-10-11T04:30:00.000Z'),
        new Date('2018-10-16T04:30:00.000Z'),
        new Date('2018-10-18T04:30:00.000Z'),
        new Date('2018-10-23T04:30:00.000Z'),
        new Date('2018-10-25T04:30:00.000Z'),
        new Date('2018-10-30T04:30:00.000Z')
      ])
    })

    it('should return all with composite', function () {
      const startDate = new Date('2018-10-01T00:00:00Z')
      const endDate = new Date('2018-11-01T00:00:00Z')
      const s = {
        schedules: [
          { dw: [3, 5], h: [4], m: [30] },
          { dw: [1], h: [1], m: [0] }
        ]
      }
      schedule(s).all(startDate, endDate).should.eql([
        new Date('2018-10-02T04:30:00.000Z'),
        new Date('2018-10-04T04:30:00.000Z'),
        new Date('2018-10-07T01:00:00.000Z'),
        new Date('2018-10-09T04:30:00.000Z'),
        new Date('2018-10-11T04:30:00.000Z'),
        new Date('2018-10-14T01:00:00.000Z'),
        new Date('2018-10-16T04:30:00.000Z'),
        new Date('2018-10-18T04:30:00.000Z'),
        new Date('2018-10-21T01:00:00.000Z'),
        new Date('2018-10-23T04:30:00.000Z'),
        new Date('2018-10-25T04:30:00.000Z'),
        new Date('2018-10-28T01:00:00.000Z'),
        new Date('2018-10-30T04:30:00.000Z')
      ])
    })

    it('should return all with composite with exception', function () {
      const startDate = new Date('2018-10-01T00:00:00Z')
      const endDate = new Date('2018-11-01T00:00:00Z')
      const s = {
        schedules: [
          { dw: [3, 5], h: [4], m: [30] },
          { dw: [1], h: [1], m: [0] }
        ],
        exceptions: [
          { D: [2, 21] }
        ]
      }
      schedule(s).all(startDate, endDate).should.eql([
        new Date('2018-10-04T04:30:00.000Z'),
        new Date('2018-10-07T01:00:00.000Z'),
        new Date('2018-10-09T04:30:00.000Z'),
        new Date('2018-10-11T04:30:00.000Z'),
        new Date('2018-10-14T01:00:00.000Z'),
        new Date('2018-10-16T04:30:00.000Z'),
        new Date('2018-10-18T04:30:00.000Z'),
        new Date('2018-10-23T04:30:00.000Z'),
        new Date('2018-10-25T04:30:00.000Z'),
        new Date('2018-10-28T01:00:00.000Z'),
        new Date('2018-10-30T04:30:00.000Z')
      ])
    })

    it('should return later.NEVER if no valid date exists', function () {
      const startDate = new Date('2018-10-01T00:00:00Z')
      const endDate = new Date('2018-11-01T00:00:00Z')
      const s = { schedules: [{ Y: [2012] }] }
      should.equal(schedule(s).all(startDate, endDate), later.NEVER)
    })

    it('should return later.NEVER if no valid date exists with only startDate passed', function () {
      const startDate = new Date('2018-10-01T00:00:00Z')
      const s = { schedules: [{ Y: [2012] }] }
      should.equal(schedule(s).all(startDate), later.NEVER)
    })

    it('should return later.NEVER if end date precludes a valid schedule', function () {
      const startDate = new Date('2013-03-21T00:00:05Z')
      const endDate = new Date('2016-01-01T00:00:05Z')
      const s = { schedules: [{ Y: [2017] }] }
      should.equal(schedule(s).all(startDate, endDate), later.NEVER)
    })

    it('should return all valid dates if one exists with exceptions', function () {
      const startDate = new Date('2013-03-21T00:00:05Z')
      const endDate = new Date('2020-01-01T00:00:05Z')
      const s = { schedules: [{ Y: [2015, 2016, 2017, 2019] }], exceptions: [{ Y: [2015] }] }
      schedule(s).all(startDate, endDate).should.eql([
        new Date('2016-01-01T00:00:00Z'),
        new Date('2017-01-01T00:00:00Z'),
        new Date('2019-01-01T00:00:00Z')
      ])
    })
  })
})
