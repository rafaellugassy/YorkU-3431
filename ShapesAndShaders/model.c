/*
 * the scene data structure is created/stored/traversed here
 *
 *	John Amanatides, Oct 2017
 */


#include <stddef.h>
#include <stdlib.h>
#include <math.h>
#include "artInternal.h"

extern Material	GetCurrentMaterial(void);
extern int	IntersectSphere(Ray *, double *, Vector *);
extern int	IntersectPlane(Ray *, double *, Vector *);
extern int	IntersectCube(Ray *, double *, Vector *);
extern int	IntersectCone(Ray *, double *, Vector *);
extern Point	InvTransPoint(Point, Affine *);
extern Vector	InvTransVector(Vector, Affine *), TransNormal(Vector, Affine *);
extern Matrix	MultMatrix(Matrix *, Matrix *);
extern void	InitCamera(void), InitLighting(void), FinishLighting(void);

#define SPHERE		1
#define PLANE		2
#define CUBE		3
#define CONE	4

typedef struct StackNode {
	Affine CTM;
	struct StackNode *next;
} StackNode;

typedef struct ListNode {
	int nodeType;
	Affine affine;
	Material material;
	struct ListNode *next;
} ListNode;

static Matrix identity= {       1.0, 0.0, 0.0, 0.0,
				0.0, 1.0, 0.0, 0.0,
				0.0, 0.0, 1.0, 0.0,
				0.0, 0.0, 0.0, 1.0};
static Affine CTM;
static StackNode *CTMstack;
static ListNode *scene;


char *
art_Start(void)
{
	CTM.TM= identity;
	CTM.inverseTM= identity;
	CTMstack= NULL;
	InitCamera();
	InitLighting();
	scene= NULL;

	return NULL;
}


static void
FreeModel(scene)
	ListNode *scene;
{
	ListNode *node;
	while(scene) {
		node= scene;
		scene= scene->next;
		free((void *) node);
		/* note material node is never removed */
	}
}


char *
art_End(void)
{
	while(CTMstack != NULL)
		(void) art_PopTM();
	FreeModel(scene);
	FinishLighting();
	return NULL;
}


char *
art_InitTM(void)
{
	CTM.TM= identity;
	CTM.inverseTM= identity;
	return NULL;
}


char *
art_PushTM(void)
{
        StackNode *sp;

	sp= (StackNode *) malloc(sizeof(StackNode));
	sp->CTM= CTM;
	sp->next= CTMstack;
	CTMstack= sp;
	return NULL;
}


char *
art_PopTM(void)
{
        StackNode *sp;

        if(CTMstack != NULL) {
                CTM= CTMstack->CTM;
                sp= CTMstack;
                CTMstack= CTMstack->next;
                free((void *) sp);
		return NULL;
        }
        else	return "stack underflow";
}


/* premultiply CTM */
static void
ApplyAffine(Affine trans)
{
	CTM.TM= MultMatrix(&trans.TM, &CTM.TM);
	CTM.inverseTM= MultMatrix(&CTM.inverseTM, &trans.inverseTM);
}


char *
art_Scale(double sx, double sy, double sz)
{
	Matrix temp1 = {sx, 0.0, 0.0, 0.0,
			0.0, sy, 0.0, 0.0,
			0.0, 0.0, sz, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Matrix temp2 = {1.0/sx, 0.0, 0.0, 0.0,
			0.0, 1.0/sy, 0.0, 0.0,
			0.0, 0.0, 1.0/sz, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Affine curTrans;
	curTrans.TM = temp1;
	curTrans.inverseTM = temp2;
	ApplyAffine(curTrans);
	/* your code goes here */
	return NULL;
}


char *
art_Rotate(char axis, double degrees)
{
	if (axis == 'x' || axis == 'X'){
		Matrix temp1 = {1.0, 0.0, 0.0, 0.0,
				0.0, cos(degrees*M_PI/180.0), -sin(degrees*M_PI/180.0), 0.0,
				0.0, sin(degrees*M_PI/180.0), cos(degrees*M_PI/180.0), 0.0,
				0.0, 0.0, 0.0, 1.0};
		Matrix temp2 = {1.0, 0.0, 0.0, 0.0,
				0.0, cos(-degrees*M_PI/180.0), -sin(-degrees*M_PI/180.0), 0.0,
				0.0, sin(-degrees*M_PI/180.0), cos(-degrees*M_PI/180.0), 0.0,
				0.0, 0.0, 0.0, 1.0};
		Affine curTrans;
		curTrans.TM = temp1;
		curTrans.inverseTM = temp2;
		ApplyAffine(curTrans);
	}
	
	else if (axis == 'y' || axis == 'Y'){
		Matrix temp1 = {	cos(degrees*M_PI/180.0), 0.0, sin(degrees*M_PI/180.0), 0.0,
				0.0, 1.0, 0.0, 0.0,
				-sin(degrees*M_PI/180.0), 0.0, cos(degrees*M_PI/180.0), 0.0,
				0.0, 0.0, 0.0, 1.0};
		Matrix temp2 = {	cos(-degrees*M_PI/180.0), 0.0, sin(-degrees*M_PI/180.0), 0.0,
				0.0, 1.0, 0.0, 0.0,
				-sin(-degrees*M_PI/180.0), 0.0, cos(-degrees*M_PI/180.0), 0.0,
				0.0, 0.0, 0.0, 1.0};
		Affine curTrans;
		curTrans.TM = temp1;
		curTrans.inverseTM = temp2;
		ApplyAffine(curTrans);
	}

	else if (axis == 'z' || axis == 'Z'){
		Matrix temp1 = {cos(degrees*M_PI/180.0), -sin(degrees*M_PI/180.0), 0.0, 0.0,
				sin(degrees*M_PI/180.0), cos(degrees*M_PI/180.0), 0.0, 0.0,
				0.0, 0.0, 0.0, 0.0,
				0.0, 0.0, 0.0, 1.0};
		Matrix temp2 = {cos(-degrees*M_PI/180.0), -sin(-degrees*M_PI/180.0), 0.0, 0.0,
				sin(-degrees*M_PI/180.0), cos(-degrees*M_PI/180.0), 0.0, 0.0,
				0.0, 0.0, 0.0, 0.0,
				0.0, 0.0, 0.0, 1.0};

		Affine curTrans;
		curTrans.TM = temp1;
		curTrans.inverseTM = temp2;
		ApplyAffine(curTrans);
	}
	/* your code goes here */
	return NULL;
}


char *
art_Translate(double tx, double ty, double tz)
{
	Matrix temp1 = {	1.0, 0.0, 0.0, tx,
			0.0, 1.0, 0.0, ty,
			0.0, 0.0, 1.0, tz,
			0.0, 0.0, 0.0, 1.0};
	Matrix temp2 = {	1.0, 0.0, 0.0, -tx,
				0.0, 1.0, 0.0, -ty,
				0.0, 0.0, 1.0, -tz,
				0.0, 0.0, 0.0, 1.0};
	Affine curTrans;
	curTrans.TM = temp1;
	curTrans.inverseTM = temp2;
	ApplyAffine(curTrans);
	/* your code goes here */
	return NULL;
}


char *
art_Shear(char axis1, char axis2, double shear)
{
	if((axis1 == 'x' || axis1 == 'X') && ( axis2 == 'y' || axis2 == 'Y')){

	Matrix temp1= {     	1.0, shear, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Matrix temp2 ={1.0, -shear, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Affine curTrans;
	curTrans.TM = temp1;
	curTrans.inverseTM = temp2;
	ApplyAffine(curTrans);
	}else if((axis1 == 'x' || axis1 == 'X') && ( axis2 == 'z' || axis2 == 'Z')){
	Matrix temp1= {     	1.0, 0.0, shear, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Matrix temp2 ={1.0, 0.0, -shear, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Affine curTrans;
		curTrans.TM = temp1;
		curTrans.inverseTM = temp2;
		ApplyAffine(curTrans);
	}else if((axis1 == 'y' || axis1 == 'Y') && ( axis2 == 'x' || axis2 == 'X')){
	Matrix temp1= {     	1.0, 0.0, 0.0, 0.0,
			shear, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Matrix temp2 ={1.0, 0.0, 0.0, 0.0,
			-shear, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Affine curTrans;
	curTrans.TM = temp1;
	curTrans.inverseTM = temp2;
	ApplyAffine(curTrans);
	}else if((axis1 == 'y' || axis1 == 'Y') && ( axis2 == 'z' || axis2 == 'Z')){
	Matrix temp1= {     	1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, shear, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Matrix temp2 ={1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, -shear, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Affine curTrans;
	curTrans.TM = temp1;
	curTrans.inverseTM = temp2;
	ApplyAffine(curTrans);
	}else if((axis1 == 'z' || axis1 == 'Z') && ( axis2 == 'x' || axis2 == 'X')){
	Matrix temp1= {     	1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			shear, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Matrix temp2 ={1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			-shear, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Affine curTrans;
	curTrans.TM = temp1;
	curTrans.inverseTM = temp2;
	ApplyAffine(curTrans);
	}else if((axis1 == 'z' || axis1 == 'Z') && ( axis2 == 'y' || axis2 == 'Y')){
	Matrix temp1= {     	1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, shear, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Matrix temp2 ={1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, -shear, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0};
	Affine curTrans;
	curTrans.TM = temp1;
	curTrans.inverseTM = temp2;
	ApplyAffine(curTrans);
	}
	/* your code goes here */
	return NULL;
}


static void AddObject(int nodeType)
{
	ListNode *object;

	object= (ListNode *) malloc (sizeof(ListNode));
	object->nodeType= nodeType;
	object->affine= CTM;
	object->material= GetCurrentMaterial();
	object->next= scene;
	scene= object;
}


char *
art_Sphere()
{
	AddObject(SPHERE);
	return NULL;
}


char *
art_Plane()
{
	AddObject(PLANE);
	return NULL;
}


char *
art_Cube()
{
	AddObject(CUBE);
	return NULL;
}

char *
art_Cone()
{
	AddObject(CONE);
	return NULL;
}


/*
 * This function, when passed a ray and list of objects
 * returns a pointer to the closest intersected object in the list
 * (whose t-value is less than t) and updates t and normal to
 * the value of the closest object's normal and t-value.
 * It returns NULL if it find no object closer than t from
 * the ray origin.  If anyHit is true then it returns the
 * first object that is closer than t.
 */
static ListNode *
ReallyIntersectScene(Ray *ray, ListNode *obj, int anyHit, double *t, Vector *normal)
{
	ListNode *closestObj, *resultObj;
	Ray transRay;
	int i, result;

	closestObj= NULL;

	while(obj != NULL) {
		/* transform ray */
		transRay.origin= InvTransPoint(ray->origin, &obj->affine);
		transRay.direction= InvTransVector(ray->direction, &obj->affine);

		/* intersect object */
		switch(obj->nodeType) {

		case SPHERE:
			result= IntersectSphere(&transRay, t, normal);
			break;
		case PLANE:
			result= IntersectPlane(&transRay, t, normal);
			break;
		case CUBE:
			result= IntersectCube(&transRay, t, normal);
			break;
		case CONE:
			result= IntersectCone(&transRay, t, normal);
			break;
		}

		/* keep closest intersection */
		if (result == HIT) {
			closestObj= obj;
			if(anyHit)
				return obj;
		}

		obj= obj->next;
	}

	return closestObj;
}


int
IntersectScene(Ray *ray, double *t, Vector *normal, Material *material)
{
	ListNode *closestObj;
	double closestT;
	Vector closestNormal;

	closestT= UNIVERSE;
	closestObj= ReallyIntersectScene(ray, scene, 0, &closestT, &closestNormal);
	if(closestObj != NULL) {
		*t= closestT;
		*normal= TransNormal(closestNormal, &closestObj->affine);
		*material= closestObj->material;
		return HIT;
	}
	else	return MISS;
}


int
ShadowProbe(Ray *ray, double distanceToLight)
{
	ListNode *closestObj;
	double closestT;
	Vector closestNormal;

	closestT= distanceToLight;
	closestObj= ReallyIntersectScene(ray, scene, 1, &closestT, &closestNormal);
	if(closestObj != NULL)
		return HIT;
	else	return MISS;
}
