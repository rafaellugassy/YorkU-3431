#include <stdio.h>
#include <stdlib.h>
FILE * fp;
int main()  {
	int input;
	fp = fopen("pthread_stats", "r");
    if (fp == NULL)
        exit(EXIT_FAILURE);

    while (fscanf(fp,"%d%*[^\n]", &input) != -1) {
        printf("%d\n", input);
    }
	return 0;
}
