/*
 * implement ray/cone intersection routine
 *
 *	John Amanatides, Oct 2017
 */


#include <math.h>
#include "artInternal.h"

extern double Normalize();

#define EPSILON	(1e-10)

/*
 * compute intersection between ray and a cone (0<= y <= 1, x^2 + z^2 <= y^2)
 * Returns MISS if no intersection; otherwise, it returns HIT and
 * sets t to the the distance  to the intersection point and sets the
 * normal vector to the outward facing normal (unit length) at the
 * intersection point.  Note: no intersection is returned if myT >= t
 * (ie my intersection point is further than something else already hit).
 */

int IntersectCone(ray, t, normal)
	Ray *ray;
	double *t;
	Vector *normal;
{
/*
	double a, b, c;
	double d, myT;
	double r1, r2;
	//Vector P;
	//TIMES(P, ray->direction, *t);
	//PLUS(P, P, ray->origin);

	//Vector temp;
	//MINUS(temp, P, normal->origin);	
	// value of cos^2 theta
	//double cosSquareTheta = pow(DOT(temp, normal->direction), 2) / DOT(temp, temp);
	
	//Vector normToRayOrigin;
	//MINUS(normToRayOrigin, normal->origin, ray->origin);

	Point hit;

	a = 1;
	b = 1;
	c = 1;

	d= b*b-4.0*a*c;
	if(d <= 0.0)
		return MISS;
	
	if(b < 0.0) {
		r2= (-b+sqrt(d))/(2.0*a);
		r1= c/(a*r2);
	} else {
		r1= (-b-sqrt(d))/(2.0*a);
		r2= c/(a*r1);
	}
	if(r1 < EPSILON)
		if(r2 < EPSILON)
			return MISS;
		else	myT= r2;
	else	myT= r1;

	if(myT >= *t)
		return MISS;
	TIMES(hit,  ray->direction, myT);
	PLUS(hit, ray->origin, hit);
	*t= myT;
	*normal= hit;

	return HIT;
*/
	return MISS;
}
